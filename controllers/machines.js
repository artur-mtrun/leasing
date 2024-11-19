const { Machine } = require('../models/machine');
const { Area } = require('../models/area');

exports.getMachines = async (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    try {
        const machines = await Machine.findAll({
            include: [{ model: Area, as: 'Area' }]
        });
        res.render('machines/machine-list', {
            machines: machines,
            pageTitle: 'Maszyny',
            path: '/machine-list',
            isAuthenticated: req.session.isLoggedIn,
            isAdmin: req.session.isAdmin
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

exports.getAddMachine = async (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    try {
        const areas = await Area.findAll();
        res.render('machines/add-machine', {
            pageTitle: 'Dodaj maszynę',
            path: '/add-machine',
            areas: areas,
            isAuthenticated: req.session.isLoggedIn,
            isAdmin: req.session.isAdmin
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

exports.postAddMachine = async (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    const machine = new Machine({
        machinenumber: req.body.machinenumber,
        descript: req.body.descript,
        area_id: req.body.area_id,
        ip: req.body.ip,
        port: req.body.port
    });

    machine.save()
    .then(result => {
        res.redirect('/machine-list');
    })
    .catch(err => {
        console.log(err);
        next(err);  
    });
};

exports.postRemoveMachine = async (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    try {
        const machineId = req.body.machineId;
        await Machine.destroy({
            where: {
                machine_id: machineId
            }
        });
        res.redirect('/machine-list');
    } catch (error) {
        console.error('Błąd podczas usuwania maszyny:', error);
        res.status(500).send('Wystąpił błąd podczas usuwania maszyny');
    }
};

exports.getEditMachine = async (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    try {
        const machineId = req.params.id;
        const machine = await Machine.findByPk(machineId);
        const areas = await Area.findAll();
        
        if (!machine) {
            return res.status(404).send('Maszyna nie znaleziona');
        }
        
        res.render('machines/edit-machine', { 
            machine: machine,
            areas: areas,
            pageTitle: 'Edytuj maszynę',
            path: '/edit-machine/' + machineId,
            isAuthenticated: req.session.isLoggedIn,
            isAdmin: req.session.isAdmin
        });
    } catch (error) {
        console.error('Błąd podczas pobierania maszyny do edycji:', error);
        res.status(500).send('Wystąpił błąd podczas pobierania maszyny do edycji');
    }
};

exports.postEditMachine = async (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    try {
        const machineId = req.params.id;
        const updatedMachine = {
            machinenumber: req.body.machinenumber,
            descript: req.body.descript,
            area_id: req.body.area_id,
            ip: req.body.ip,
            port: req.body.port
        };
        await Machine.update(updatedMachine, {
            where: { machine_id: machineId }
        });
        res.redirect('/machine-list');
    } catch (error) {
        console.error('Błąd podczas aktualizacji maszyny:', error);
        res.status(500).send('Wystąpił błąd podczas aktualizacji maszyny');
    }
};