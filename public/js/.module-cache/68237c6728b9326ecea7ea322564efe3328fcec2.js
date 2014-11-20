/**
 * @jsx React.DOM
 */

bone.router({
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

bone.router.routes[snowPath.root] = "redirect";
bone.router.routes[snowPath.root + snowPath.wallet] = "overview";
bone.router.routes[snowPath.root + snowPath.wallet + "/:wallet/:moon"] = "wallet";
bone.router.routes[snowPath.root + snowPath.receive + "/:moon"] = "receive";
bone.router.routes[snowPath.root + snowPath.settings + "/:moon"] = "settings" ;
bone.router.routes[snowPath.root + snowPath.inqueue + "/:moon"] = "inqueue";

bone.router.start({pushState: true});
