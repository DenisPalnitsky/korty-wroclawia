/** CI uses TZ=Europe/Warsaw; pricing uses local getHours()/getDay(). Pin TZ before any app code loads. */
process.env.TZ = 'Europe/Warsaw';
