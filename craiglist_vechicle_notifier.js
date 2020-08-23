
var cron = require('node-cron');
var daily_listings = new Set();
var current_day = new Date().getDate();

const accountSid = '-------------------------------';
const authToken = '-------------------------------';
const client_twilio = require('twilio')(accountSid, authToken);
var numbers = ["+1231234567"];

cron.schedule('*/5 * * * *', () => {

  var currentdate = new Date();
  var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/"
                + currentdate.getFullYear() + " @ "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();

  if (currentdate.getDate() != current_day)
  {
    daily_listings.clear();
    current_day = currentdate.getDate();
    console.log('New Day');
  }

  const fs = require('fs');
  var message = "===========  " + datetime + "  ===========\n\n"
  fs.appendFile('log.txt', message, function (err) {
  if (err) throw err;
  });

  var
    craigslist = require('node-craigslist'),
    client = new craigslist.Client({
      city : 'chicago'
    }),
    options = {
     category : 'cta',
     maxPrice : '99999',
     minPrice : '1',
     postal : '60007',
     searchDistance : '1000'
   };

  client
    .search(options,'sprinter')
    .then((listings) =>
    {
      listings.slice(0, 10).forEach((listing) =>
      {
        var date2 = currentdate.getFullYear()+'-'+(currentdate.getMonth()+1)+'-'+currentdate.getDate();
        if (listing.date.split(" ")[0] == date2 && !daily_listings.has(listing.url) )
        {
          daily_listings.add(listing.url);

          numbers.forEach(function(value){
          client_twilio.messages
                .create({
                   body: listing.url,
                   from: '+12673102651',
                   to: value
                 })
                .then(message => console.log(message.sid))
                .done();
              })

          //console.log(daily_listings);
          var message = listing.title + "\n" + listing.price + "\n" + listing.url + "\n\n"
          fs.appendFile('log.txt', message, function (err) {
          if (err) throw err;
          });
        }
    })
    })
    .catch((err) => {
      console.error(err);
    });
});
