var sql = require('./sql');
var mssql = require('mssql');


function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

exports.index = function(req, res) {
	res.send('<h1>Root page!</h1>');
}

exports.apiIndex = function(req, res) {
    var vm = {                          // vm = View Model
        title: 'API Functions',
        api: [
            { name: 'All users', url: '/api/users' }, 
            { name: 'User by Username', url: '/api/users/meka' },         
            { name: 'All posts for one user', url: '/api/posts/5' },
            { name: 'Most highly rated users', url: '/api/stats/humanratings' },
            { name: 'Most highly rated animals with users', url: '/api/stats/animalratings/hamster' },
            { name: 'Sitters with the most experience', url: '/api/stats/experiencedsitters' },
        ]
    };
    
    res.render('api-index', vm);
};


exports.users = function(req, res) {
    var query = 'select * from dbo.Users';
    
    // If there's an ID passed along
    if (typeof(req.params.id) !== 'undefined') {
        if (isNumber(req.params.id)) {
            query = query.concat(' where uID=' + req.params.id);
        } else {
            query = query.concat(' where userName=\'' + req.params.id + '\'');            
        }
    }

    var result = sql.querySql(query, function(data) {
        if (data !== undefined)
        {
            //console.log('DATA rowsAffected: ' + data.rowsAffected);
            res.send(data.recordset);
        }
    }, function(err) {
        console.log('ERROR: ' + err);
        res.status(500).send('ERROR: ' + err);
    });
}



exports.postDetails = function(req, res) {
    var id = '';
    // If there's an ID passed along
    if (typeof(req.params.id) !== 'undefined') {
        id = req.params.id;
    }

    var query = 'select Animals.petname, Animals.type, Animals.age, holdingID, beginningDate, endDate, pay, activities, extraInformation, complete '+
    'from Holdings '+
    'inner join Animals on Animals.aID = Holdings.animalID '+
    'inner join Users on Animals.ownerID = Users.uID '+
    'where Users.uID = ' + id + 
    ' order by beginningDate DESC'


    var result = sql.querySql(query, function(data) {
        if (data !== undefined)
        {
            //console.log('DATA rowsAffected: ' + data.rowsAffected);

            var posting = data.recordsets[0][0];
            if (data.recordsets.length > 1) {
                var media = data.recordsets[1];

                posting.media = media;
            }
            if (data.recordsets.length > 2) {
                var comments = data.recordsets[2];

                posting.comments = comments;
            }
            
            res.send(posting);
        }
    }, function(err) {
        console.log('ERROR: ' + err);
        res.status(500).send('ERROR: ' + err);
    });
}

exports.humanratings = function(req, res) {
    var query = 'SELECT top 10 firstName, lastName, AVG(rating) as avgRating from Users '+
	'inner join UserRatings on Users.uID = UserRatings.userID '+
	'group by uID, firstName, lastName '+
	'order by avgRating DESC'

    var result = sql.querySql(query, function(data) {
        if (data !== undefined)
        {
            //console.log('DATA rowsAffected: ' + data.rowsAffected);
            res.send(data.recordset);
        }
    }, function(err) {
        console.log('ERROR: ' + err);
        res.status(500).send('ERROR: ' + err);
    });
}

exports.animalratings = function(req, res) {
    let type = req.params.type

    var query = 'SELECT top 10 petname, type, age, AVG(rating) as avgRating, Users.firstName as ownerFirstName, Users.lastName as ownerLastName from Animals '+
    'inner join Holdings on Animals.aID = Holdings.animalID '+
    'inner join AnimalRatings on Holdings.holdingID = AnimalRatings.holdingID '+
    'inner join Users on Users.uID = Animals.ownerID '+
    'where Animals.type = \'' + type + '\'' +
	' group by Animals.petname, type, age, Users.firstName, Users.lastName '+
	'order by avgRating DESC'
    var result = sql.querySql(query, function(data) {
        if (data !== undefined)
        {
            //console.log('DATA rowsAffected: ' + data.rowsAffected);
            res.send(data.recordset);
        }
    }, function(err) {
        console.log('ERROR: ' + err);
        res.status(500).send('ERROR: ' + err);
    });
}

exports.experiencedSitters = function(req, res) {
    var query = 'SELECT top 10 firstName, lastName, COUNT(Holdings.holdingID) as totalHoldings, AVG(rating) as avgRating from Users '+
    'inner join UserRatings on Users.uID = UserRatings.userID '+
    'inner join Holdings on Users.uID = Holdings.sitterID '+
	'group by uID, firstName, lastName '+
	'order by totalHoldings DESC'
    
    var result = sql.querySql(query, function(data) {
        if (data !== undefined)
        {
            //console.log('DATA rowsAffected: ' + data.rowsAffected);
            res.send(data.recordset);
        }
    }, function(err) {
        console.log('ERROR: ' + err);
        res.status(500).send('ERROR: ' + err);
    });
}

exports.genderDivision = function(req, res) {
    var query = 'SELECT Gender.Name AS Gender, Count([User].ID) AS Users ' +
    '     FROM dbo.[User] INNER JOIN ' +
    '          dbo.Gender ON [User].GenderID = Gender.ID ' +
    '    GROUP BY Gender.Name ';
    
    var result = sql.querySql(query, function(data) {
        if (data !== undefined)
        {
            console.log('DATA rowsAffected: ' + data.rowsAffected);
            res.send(data.recordset);
        }
    }, function(err) {
        console.log('ERROR: ' + err);
        res.status(500).send('ERROR: ' + err);
    });
}

exports.default = function(req, res) {
	res.status(404).send('Invalid route');
}
