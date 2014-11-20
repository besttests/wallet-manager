/**
 * @jsx React.DOM
 */
 
var addroute = {}

addroute[snowPath.routeRoot] = "redirect";
addroute[''] = "redirect";
addroute[snowPath.routeRoot + '/'] = "redirect";

addroute[snowPath.routeRoot + snowPath.wallet + "/:wallet/:moon"] = "wallet";
addroute[snowPath.routeRoot + snowPath.wallet + "/:wallet"] = "wallet";
addroute[snowPath.routeRoot + snowPath.wallet + '/'] = "wallet";
addroute[snowPath.routeRoot + snowPath.wallet] = "wallet";

addroute[snowPath.routeRoot + snowPath.receive + "/:moon"] = "receive";
addroute[snowPath.routeRoot + snowPath.receive + "/"] = "receive";
addroute[snowPath.routeRoot + snowPath.receive ] = "receive";

addroute[snowPath.routeRoot + snowPath.settings + "/:moon"] = "settings" ;
addroute[snowPath.routeRoot + snowPath.settings + "/"] = "settings" ;
addroute[snowPath.routeRoot + snowPath.settings ] = "settings" ;

addroute[snowPath.routeRoot + snowPath.inqueue + "/:moon"] = "inqueue";
addroute[snowPath.routeRoot + snowPath.inqueue + "/"] = "inqueue";
addroute[snowPath.routeRoot + snowPath.inqueue] = "inqueue";

bone.router({
    routes: addroute,
    overview: function() {
        React.renderComponent(UI({section: "wallet", wallet: "overview"}), document.getElementById('snowcoins-react'));
    },
    redirect: function() {
        bone.router.navigate(snowPath.routeRoot + snowPath.wallet,{trigger:true});
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
