const { Sequelize } = require('sequelize');
const {Event} = require('../models/event');
//const {Employee} = require('../models/employee');
const { Op } = require('sequelize');
const { AllEvent, Employee } = require('../models/associations');
const { logAction } = require('../middleware/logger');


exports.getAllEvents = async (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.status(401).json({ message: 'Unauthorized' });
}
  try {
    const events = await Event.findAll({
      where: {
        is_del: false
      },
      attributes: [
        'event_id',
        'machinenumber',
        'enrollnumber',
        'in_out',
        'event_date',
        'event_time',
        [Sequelize.literal(`(SELECT "nick" FROM "employees" WHERE "employees"."enrollnumber" = "event"."enrollnumber")`), 'nick']
      ],
      order: [['event_date', 'DESC']]
    });
    res.json(events);
  } catch (err) {
    console.error('Error in getAllEvents:', err);
    next(err);
  }
};

exports.createEvent = async (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const { machinenumber, enrollnumber, in_out, event_date, event_time } = req.body;
    const event = await Event.create({
      machinenumber,
      enrollnumber,
      in_out,
      event_date,
      event_time
    });

    // Poprawiony log - używamy event.event_id zamiast event.id
    await logAction(
      req.session.operator_id,
      'CREATE',
      'EVENT',
      event.event_id,
      `Dodano zdarzenie dla pracownika: ${event.enrollnumber}, wejście/wyjście: ${event.in_out ? 'Wejście' : 'Wyjście'}`
    );

    res.status(201).json(event);
  } catch (err) {
    console.error('Błąd podczas tworzenia zdarzenia:', err);
    next(err);
  }
};

exports.updateEvent = async (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const event = await Event.findOne({
      where: {
        event_id: req.params.id,
        is_del: false
      }
    });
    
    if (event) {
      await event.update({
        in_out: req.body.in_out
      });

      // Poprawiony log
      await logAction(
        req.session.operator_id,
        'UPDATE',
        'EVENT',
        event.event_id,
        `Zaktualizowano zdarzenie dla pracownika: ${event.enrollnumber}, nowa wartość wejście/wyjście: ${event.in_out ? 'Wejście' : 'Wyjście'}`
      );

      res.json(event);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (err) {
    console.error('Error in updateEvent:', err);
    next(err);
  }
};

exports.deleteEvent = async (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Pobierz dane przed usunięciem
    const eventDetails = `Usunięto zdarzenie dla pracownika: ${event.enrollnumber}, typ: ${event.in_out ? 'Wejście' : 'Wyjście'}, ` +
                         `data: ${event.event_date.toLocaleDateString()}, godzina: ${event.event_time}`;

    await Event.update(
      { is_del: true },
      { where: { event_id: req.params.id } }
    );

    // Dodajemy log
    await logAction(
      req.session.operator_id,
      'DELETE',
      'EVENT',
      event.event_id,
      eventDetails
    );

    res.status(200).json({ message: 'Event marked as deleted' });
  } catch (err) {
    console.error('Błąd podczas usuwania zdarzenia:', err);
    next(err);
  }
};


exports.getEventsByMonth = async (req, res) => {
    try {
        const { year, month, enrollnumber } = req.query;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        let whereClause = {
            event_date: {
                [Op.between]: [startDate, endDate]
            }
        };

        if (enrollnumber) {
            whereClause.enrollnumber = enrollnumber;
        }

        const events = await Event.findAll({
            where: whereClause,
            order: [['event_date', 'DESC'], ['event_time', 'ASC']]
        });

        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getEventsByMonthAndEmployee = async (req, res) => {
    try {
        const { year, month, enrollnumber } = req.query;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        console.log('Data początkowa:', startDate, 'Data końcowa:', endDate);

        const events = await Event.findAll({
            where: {
                enrollnumber: enrollnumber,
                event_date: {
                    [Op.between]: [startDate, endDate]
                },
                is_del: false
            },
            attributes: [
                'event_id',
                'machinenumber',
                'enrollnumber',
                'in_out',
                'event_date',
                [Sequelize.fn('to_char', Sequelize.col('event_time'), 'HH24:MI'), 'event_time']
            ],
            order: [['event_date', 'ASC'], ['event_time', 'ASC']]
        });

        console.log('Znalezione wydarzenia:', events.length);

        // Pobierz wszystkich pracowników
        const employees = await Employee.findAll({
            attributes: ['enrollnumber', 'nick']
        });

        // Utwórz mapę pracowników dla szybkiego dostępu
        const employeeMap = new Map(employees.map(emp => [emp.enrollnumber, emp.nick]));

        // Dodaj nick do każdego eventu
        const eventsWithNick = events.map(event => ({
            ...event.toJSON(),
            nick: employeeMap.get(event.enrollnumber) || 'Nieznany'
        }));

        res.json(eventsWithNick);
    } catch (error) {
        console.error('Błąd podczas pobierania wydarzeń:', error);
        res.status(500).json({ message: 'Wewnętrzny błąd serwera', error: error.message });
    }
};

exports.getEmployees = async (req, res) => {
  try {
    const isAdmin = req.session.isAdmin;
    console.log('isAdmin:', isAdmin);
    const operatorAreaId = req.session.area_id;

    let whereClause = {};
    if (!isAdmin) {
      whereClause.area_id = operatorAreaId;
    }

    const employees = await Employee.findAll({
      where: whereClause,
      attributes: ['enrollnumber', 'nick'],
      order: [['nick', 'ASC']]
    });

    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
