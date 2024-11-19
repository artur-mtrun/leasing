const { Operator } = require('../models/operator');

console.log('Operator:', Operator);

// Kontroler renderujący stronę logowania
exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        isAuthenticated: false
    });
};

// Kontroler obsługujący proces logowania
exports.postLogin = async (req, res, next) => {
    try {
        console.log('Rozpoczęcie procesu logowania');
        const { login, password } = req.body;
        console.log('Dane logowania:', { login, password });

        // Sprawdzenie, czy tabela operatorów jest pusta
        const operatorCount = await Operator.count();
        console.log('Liczba operatorów:', operatorCount);

        // Jeśli tabela operatorów jest pusta, automatycznie logujemy użytkownika
        if (operatorCount === 0) {
            console.log('Tabela operatorów jest pusta. Logowanie bez poświadczeń.');
            req.session.isLoggedIn = true;
            req.session.area_id = 0;
            await req.session.save();
            return res.redirect('/');
        }

        // Próba znalezienia operatora o podanym loginie
        console.log('Próba znalezienia operatora');
        const user = await Operator.findOne({
            where: { login }
        });
        console.log('Znaleziony użytkownik:', user);

        // Sprawdzenie, czy użytkownik istnieje i czy hasło jest poprawne
        if (user && user.comparePassword(password)) {
            console.log('Logowanie udane');
            // Ustawienie danych sesji
            req.session.isLoggedIn = true;
            req.session.area_id = user.area_id;
            req.session.isAdmin = user.is_admin;
            console.log('Admin:', req.session.isAdmin);
            console.log('Obszar:', req.session.area_id);
            // Zapisanie sesji i przekierowanie na stronę główną
            await req.session.save();
            return res.redirect('/');
        } else {
            console.log('Logowanie nieudane');
            return res.redirect('/login');
        }
    } catch (error) {
        // Obsługa błędów podczas procesu logowania
        console.error('Błąd logowania:', error);
        return res.redirect('/login');
    }
};

// Kontroler obsługujący wylogowanie
exports.postLogout = (req, res, next) => {
    // Zniszczenie sesji i przekierowanie na stronę główną
    req.session.destroy(err => {
      console.log(err);
      res.redirect('/');
    });
  };