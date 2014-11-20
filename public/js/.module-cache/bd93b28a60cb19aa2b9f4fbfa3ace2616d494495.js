/**
 * @jsx React.DOM
 */
 
var addroute = {}
addroute[snowPath.root] = "redirect";
addroute[snowPath.root + snowPath.wallet] = "overview";
addroute[snowPath.root + snowPath.wallet + "/:wallet/:moon"] = "wallet";
addroute[snowPath.root + snowPath.receive + "/:moon"] = "receive";
addroute[snowPath.root + snowPath.settings + "/:moon"] = "settings" ;
addroute[snowPath.root + snowPath.inqueue + "/:moon"] = "inqueue";

console.log(addroute)
bone.router({
    routes: addroute,
    overview: function() {
        React.renderComponent(UI({section: "wallet", wallet: "overview"}), document.getElementById('snowcoins-react'));
    },
    redirect: function() {
        bone.router.navigate('overview');
    },
    wallet: function(wallet,moon) {
        React.renderComponent(UI({section: "wallet", wallet: wallet, moon: moon}), document.getElementById('snowcoins-react'));
    },
    settings: function(moon) {
        React.renderComponent(UI({section: "inqueue", moon: moon}), document.getElementById('snowcoins-react'));
    },
    receive: function(moon) {
        React.renderComponent(UI({section: "inqueue", moon: moon}), document.getElementById('snowcoins-react'));
    },
    inqueue: function(moon) {
        React.renderComponent(UI({section: "inqueue", moon: moon}), document.getElementById('snowcoins-react'));
    },
    
});


bone.router.start({pushState: true});
