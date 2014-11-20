var keystone = require('keystone'),
	async = require('async'),
	fs = require('fs'),
	User = keystone.list('User'),
	hat=require('hat');

var admins = [
	{ username: 'snowadmin',email: 'defaultuser@snowpi.org', password: 'snowpass', name: { first: 'Snow', last: 'Cat' } }
];

function createAdmin(admin, done) {
	User.model.findOne({ email: admin.email }).exec(function(err, user) {
		admin.isAdmin = true;
		new User.model(admin).save(function(err) {
			if (err) {
				console.error("Error adding admin " + admin.email + " to the database:");
				console.error(err);
			} else {
				console.log("Added admin " + admin.email + " to the database.");
			}
			done();
		});
	});
}

function addPrivate() {
	fs.mkdirSync(process.cwd() +'/.private');
	fs.mkdirSync(process.cwd() +'/.private/backups');
}
function addDotEnv() {
	var stream = fs.createWriteStream(process.cwd() +'/.env');
	stream.once('open', function(fd) {
	  stream.write('NODE_TLS_REJECT_UNAUTHORIZED = "0"\n');
	  stream.write("MANDRILL_KEY=v17RkIoARDkqTqPSbvrmkw\n");
	  stream.write("COOKIE_SECRET="+hat()+"\n");
	  stream.write("CLOUDINARY_URL=''\n");
	  stream.write("SECRET_KEY="+hat()+"\n");
	  stream.end();
	});
}
exports = module.exports = function(done) {
	addPrivate();
	addDotEnv();
	async.forEach(admins, createAdmin, done);
};
