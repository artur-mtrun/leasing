const { Account } = require('../models/account');

exports.getAccounts = async (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    Account.findAll()
    .then(accounts => {
        res.render('accounts/account-list', {
            accounts: accounts,
            pageTitle: 'Konta',
            path: '/account-list',
            isAuthenticated: req.session.isLoggedIn,
            isAdmin: req.session.isAdmin
        }); 
    })
    .catch(err => {
        console.log(err);
        next(err);
    });
};

exports.getAddAccount = async (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    res.render('accounts/add-account', {
        pageTitle: 'Dodaj konto',
        path: '/add-account',
        isAuthenticated: req.session.isLoggedIn,
        isAdmin: req.session.isAdmin
    });
};

exports.postAddAccount = async (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    const account = new Account({
        account_number: req.body.account_number,
        account_descript: req.body.account_descript
    });

    account.save()
    .then(result => {
        res.redirect('/account-list');
    })
    .catch(err => {
        console.log(err);
        next(err);  
    });
};

exports.postRemoveAccount = async (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    try {
        const accountId = req.body.accountId;
        await Account.destroy({
            where: {
                account_id: accountId
            }
        });
        res.redirect('/account-list');
    } catch (error) {
        console.error('Błąd podczas usuwania konta:', error);
        res.status(500).send('Wystąpił błąd podczas usuwania konta');
    }
};

exports.getEditAccount = async (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    try {
        const accountId = req.params.id;
        const account = await Account.findByPk(accountId);
        if (!account) {
            return res.status(404).send('Konto nie znalezione');
        }
        res.render('accounts/edit-account', { 
            account: account,
            pageTitle: 'Edytuj konto',
            path: '/edit-account/' + accountId,
            isAuthenticated: req.session.isLoggedIn,
            isAdmin: req.session.isAdmin
        });
    } catch (error) {
        console.error('Błąd podczas pobierania konta do edycji:', error);
        res.status(500).send('Wystąpił błąd podczas pobierania konta do edycji');
    }
};

exports.postEditAccount = async (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    try {
        const accountId = req.params.id;
        const updatedAccount = {
            account_number: req.body.account_number,
            account_descript: req.body.account_descript
        };
        await Account.update(updatedAccount, {
            where: { account_id: accountId }
        });
        res.redirect('/account-list');
    } catch (error) {
        console.error('Błąd podczas aktualizacji konta:', error);
        res.status(500).send('Wystąpił błąd podczas aktualizacji konta');
    }
};

