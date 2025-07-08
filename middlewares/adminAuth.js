function authenticateADM(req, res, next) {
    if (req.session.user && req.session.user.roles != undefined) {
        if (req.session.user.roles === "lowuser") {
            return res.redirect("/login");
        } else if (req.session.user.roles === "admin") {
            next();
        } else {
            return res.redirect("/login");
        }
    } else {
        res.redirect("/login");
    }
}


function authenticateLowuser(req, res, next) {
    if (req.session.user && req.session.user.roles != undefined) {
        if (req.session.user.roles === "lowuser") {
            next();
        } else if (req.session.user.roles === "admin") {
            return res.redirect("/login");
        } else {
            return res.redirect("/login");
        }
    } else {
        res.redirect("/login");
    }
}

function authenticateAdminOrLowuser(req, res, next) {
    if (req.session.user && req.session.user.roles != undefined) {
        if (req.session.user.roles === "lowuser" || req.session.user.roles === "admin") {
            next();
        } else {
            return res.redirect("/login");
        }
    } else {
        res.redirect("/login");
    }
}




module.exports = {
    authenticateADM,
    authenticateLowuser,
    authenticateAdminOrLowuser
};
