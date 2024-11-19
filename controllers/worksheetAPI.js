const {Worksheet} = require('../models/worksheet');
const { Employee } = require('../models/employee');
const { Event } = require('../models/event');
const { Op } = require('sequelize');
const { Account } = require('../models/account');
const { getEventsByMonthAndEmployee } = require('./eventsAPI');
const { Company } = require('../models/company');


exports.getWorksheets = async (req, res) => {
  try {
    const worksheets = await Worksheet.findAll();
    res.json(worksheets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createWorksheet = async (req, res) => {
  try {
    const worksheet = await Worksheet.create(req.body);
    res.status(201).json(worksheet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.getAllEmployees = async (req, res) => {
    console.log('Otrzymano żądanie getAllEmployees');
    try {
        const employees = await Employee.findAll({
            attributes: ['enrollnumber', 'nick'],
            order: [['nick', 'ASC']]
        });
        console.log('Znaleziono pracowników:', employees);
        res.json(employees);
    } catch (err) {
        console.error('Błąd podczas pobierania pracowników:', err);
        res.status(500).json({ message: 'Wystąpił błąd serwera' });
    }
};

exports.getEvents = getEventsByMonthAndEmployee;

exports.getWorksheetData = async (req, res) => {
    try {
        console.log('Dupa dupa dupa Otrzymano żądanie getWorksheetData z parametrami:', req.query);
        const { year, month, enrollnumber } = req.query;
        console.log('Pobieranie danych arkusza roboczego dla:', { year, month, enrollnumber });
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        console.log('Zakres dat:', { startDate, endDate });

        const worksheetData = await Worksheet.findAll({
            where: {
                enrollnumber: enrollnumber,
                event_date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: [{ model: Account, attributes: ['account_number', 'account_descript'] }],
            order: [['event_date', 'ASC'], ['in_time', 'ASC']]
        });

        console.log('Dane arkusza roboczego:', worksheetData);

        res.json(worksheetData);
    } catch (error) {
        console.error('Błąd podczas pobierania danych arkusza roboczego:', error);
        res.status(500).json({ message: 'Wystąpił błąd serwera', error: error.message });
    }
};

exports.addWorksheetEntry = async (req, res) => {
    try {
        const { day, month, year, enrollnumber, machinenumber, in_time, out_time, account_id, work_time } = req.body;
        
        console.log('Otrzymany czas pracy:', work_time); // Dodaj to dla debugowania

        // Sprawdź, czy pracownik istnieje
        const employee = await Employee.findOne({
            where: { enrollnumber: enrollnumber }
        });

        if (!employee) {
            return res.status(400).json({ message: 'Nie znaleziono pracownika o podanym enrollnumber' });
        }

        // Tworzenie daty z otrzymanych danych
        const event_date = new Date(year, month - 1, day);
        console.log('Utworzona data:', event_date);

        // Tworzenie nowego wpisu
        const newEntry = await Worksheet.create({
            enrollnumber,
            event_date,
            machinenumber,
            in_time,
            out_time,
            account_id,
            company_id: employee.company_id,
            work_time // Używamy przesłanej wartości work_time bez modyfikacji
        });

        console.log('Utworzony nowy wpis:', newEntry);

        res.status(201).json({ message: 'Wpis dodany pomyślnie', entry: newEntry });
    } catch (error) {
        console.error('Błąd podczas dodawania wpisu:', error);
        res.status(500).json({ message: 'Wystąpił błąd podczas dodawania wpisu', error: error.message });
    }
};

exports.postEditEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const { day, month, year, enrollnumber, machinenumber, in_time, out_time, account_id, work_time } = req.body;
        
        const event_date = new Date(year, month - 1, day);

        const [updatedCount, updatedEntries] = await Worksheet.update(
            {
                enrollnumber,
                event_date,
                machinenumber,
                in_time,
                out_time,
                account_id,
                work_time
            },
            {
                where: { worksheet_id: id },
                returning: true
            }
        );

        if (updatedCount === 0) {
            return res.status(404).json({ message: 'Wpis nie został znaleziony' });
        }

        res.status(200).json({ message: 'Wpis zaktualizowany pomyślnie', entry: updatedEntries[0] });
    } catch (error) {
        console.error('Błąd podczas aktualizacji wpisu:', error);
        res.status(500).json({ message: 'Wystąpił błąd podczas aktualizacji wpisu', error: error.message });
    }
};

// Dodaj nową funkcję do pobierania kont (będzie używana do wypełniania select'a w formularzu)
exports.getAccounts = async (req, res) => {
    try {
        const accounts = await Account.findAll({
            attributes: ['account_id', 'account_number', 'account_descript'],
            order: [['account_number', 'ASC']]
        });
        res.json(accounts);
    } catch (error) {
        console.error('Błąd podczas pobierania kont:', error);
        res.status(500).json({ message: 'Wystąpił błąd serwera', error: error.message });
    }
};

exports.getWorksheetDataForDay = async (req, res) => {
    try {
        const { year, month, day, enrollnumber } = req.query;
        const date = new Date(year, month - 1, day);

        const worksheetData = await Worksheet.findOne({
            where: {
                enrollnumber: enrollnumber,
                event_date: date
            }
        });

        res.json(worksheetData);
    } catch (error) {
        console.error('Błąd podczas pobierania danych Worksheet:', error);
        res.status(500).json({ message: 'Wystąpił błąd serwera', error: error.message });
    }
};

exports.getEmployeeData = async (req, res) => {
    try {
        const { enrollnumber } = req.query;
        console.log('Szukam pracownika o enrollnumber:', enrollnumber);
        
        const employee = await Employee.findOne({
            where: { enrollnumber: enrollnumber },
            attributes: ['enrollnumber', 'company_id'],
            include: [{
                model: Company,
                as: 'Company',  // Dodajemy alias 'company'
                attributes: ['company_id', 'company_descript']
            }]
        });

        console.log('Znaleziony pracownik:', employee);

        if (employee) {
            res.json(employee);
        } else {
            res.status(404).json({ message: 'Pracownik nie znaleziony' });
        }
    } catch (error) {
        console.error('Błąd podczas pobierania danych pracownika:', error);
        res.status(500).json({ message: 'Wystąpił błąd serwera', error: error.toString() });
    }
};

exports.getWorksheetReport = async (req, res) => {
    try {
        const { year, month, account_id, company_id, employee_id } = req.query;
        
        let whereClause = {
            event_date: {
                [Op.between]: [
                    new Date(year, month - 1, 1),
                    new Date(year, month, 0)
                ]
            }
        };

        if (account_id) whereClause.account_id = account_id;
        if (company_id) whereClause.company_id = company_id;
        if (employee_id) whereClause.enrollnumber = employee_id;

        const report = await Worksheet.findAll({
            where: whereClause,
            include: [
                { model: Employee, attributes: ['nick'] },
                { model: Company, attributes: ['company_descript'] },
                { model: Account, attributes: ['account_number', 'account_descript'] }
            ],
            order: [['event_date', 'ASC'], ['in_time', 'ASC']]
        });

        const formattedReport = report.map(entry => ({
            event_date: entry.event_date,
            employee_nick: entry.employee.nick,
            company_descript: entry.company.company_descript,
            account_number: entry.account.account_number,
            account_descript: entry.account.account_descript,
            in_time: entry.in_time,
            out_time: entry.out_time,
            work_time: entry.work_time
        }));

        res.json(formattedReport);
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Wystąpił błąd podczas generowania raportu', error: error.message });
    }
};

exports.getCompanies = async (req, res) => {
    try {
        const companies = await Company.findAll({
            attributes: ['company_id', 'company_descript'],
            order: [['company_descript', 'ASC']]
        });
        res.json(companies);
    } catch (error) {
        console.error('Error fetching companies:', error);
        res.status(500).json({ message: 'Wystąpił błąd podczas pobierania firm', error: error.message });
    }
};

exports.getWorksheetTimesheet = async (req, res) => {
    try {
        const { year, month, account_id, company_id, employee_id } = req.query;
        
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        
        // Buduj warunek WHERE
        const whereClause = {
            event_date: {
                [Op.between]: [startDate, endDate]
            }
        };
        
        if (account_id) whereClause.account_id = account_id;
        if (company_id) whereClause.company_id = company_id;
        if (employee_id) whereClause.enrollnumber = employee_id;

        const worksheets = await Worksheet.findAll({
            where: whereClause,
            include: [
                { 
                    model: Employee,
                    required: true,
                    attributes: ['nick', 'enrollnumber']
                }
            ],
            order: [
                [{ model: Employee, as: 'employee' }, 'nick', 'ASC'],
                ['event_date', 'ASC']
            ]
        });

        console.log('Found worksheets:', worksheets.length); // dla debugowania

        // Grupuj dane według pracowników
        const employeeData = {};
        
        worksheets.forEach(worksheet => {
            if (!worksheet.employee) return;
            
            const employeeNick = worksheet.employee.nick;
            const enrollnumber = worksheet.employee.enrollnumber;
            const day = new Date(worksheet.event_date).getDate();
            
            if (!employeeData[enrollnumber]) {
                employeeData[enrollnumber] = {
                    employee_nick: employeeNick,
                    enrollnumber: enrollnumber,
                    days: {},
                    total: 0
                };
            }
            
            if (!employeeData[enrollnumber].days[day]) {
                employeeData[enrollnumber].days[day] = 0;
            }
            employeeData[enrollnumber].days[day] += worksheet.work_time;
            employeeData[enrollnumber].total += worksheet.work_time;
        });

        const sortedData = Object.values(employeeData).sort((a, b) => 
            a.employee_nick.localeCompare(b.employee_nick)
        );

        res.json(sortedData);
    } catch (error) {
        console.error('Error generating timesheet:', error);
        console.error('Error details:', error.stack); // dodane szczegóły błędu
        res.status(500).json({ 
            message: 'Wystąpił błąd podczas generowania karty pracy', 
            error: error.message 
        });
    }
};
