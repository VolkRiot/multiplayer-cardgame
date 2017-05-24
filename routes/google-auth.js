module.exports = function(app, passport)
{
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    app.get('/auth/google/callback', 
    passport.authenticate('google', 
    { failureRedirect: '/' }),
    function(req, res) 
    {
        //console.log("redirecting\n\n");
        res.redirect('/');
    });

    app.get('/api/user', function(req, res)
    {
        res.json(req.user);
    });
    // {
    //     // TODO: DEBUGGING THIS
    //     //res.json(req.user);
    //
    //     ///////////////////////////////////////////////////////////////////////////////////////
    //     res.json({ user_name: 'Misha' + String(Math.floor(Math.random() * 100)),
    //       email: 'metrikin@gmail.com',wins: 0 })
    //     ///////////////////////////////////////////////////////////////////////////////////////
    // });

    app.get('/logout', function(req, res) 
    {
        req.logout();
        res.redirect('/');
    });

}