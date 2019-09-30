module.exports.getHelp= (req,res)=>{
    const breadcrumbs =  req.breadcrumbs();
    res.status(200).render('help',{
        path: '/help',
        breadcrumbs,
        //seo
        title: 'Help: FAQ and your problems',
        description: 'Please ask any unanswered question or get your answer',
        keywords: 'online, medical, post graduation, residency, fcps, frcs, MD, MS, Exam'
    })
}

module.exports.getAboutUs= (req,res)=>{
    const breadcrumbs =  req.breadcrumbs();
    res.status(200).render('about-us',{
        path: '/about-us',
        breadcrumbs,
        //seo
        title: 'About: Online exam based Coaching platform for post graduation medical residency exam',
        description: 'We are building an online exam platform for post graduation medical entrance exam',
        keywords: 'online, medical, post graduation, residency, fcps, frcs, MD, MS, Exam'
    })
}