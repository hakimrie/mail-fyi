/**
 * Retrieves all inbox and post body email from pak Soegi with subject: "fyi" to google sites
 * https://sites.google.com/a/kaskusnetworks.com/hakim/home/articles
 * For more information on using the GMail API, see
 * https://developers.google.com/apps-script/class_gmailapp
 */
function processInbox() {
  Logger.log("start reading inbox");
  // get top 50 inbox (assuming no more than 50 threads within a day)
  // sort it based on first message date, since sometimes old thread goes up because of new message/reply
  // it make sure that only latest message read and posted to google site
  var threads = GmailApp.getInboxThreads(0, 50).sort(function(thread1, thread2){
    return thread2.getMessages()[0].getDate().getTime() - thread1.getMessages()[0].getDate().getTime();
  });
  
  var day_in_miliseconds = 86400000; // 24*60*60*1000
//  Logger.log("total: " + threads.length);
  if (threads.length > 0){
    for (var i = 0; ; i++) {
      // get all messages in a given thread
      var thread = threads[i];
      var firstmessage = thread.getMessages()[0];
      var firstmessagedate = firstmessage.getDate()
      var now = new Date();
      // only check for past 24 hour email
      if ((now.getTime() - firstmessagedate.getTime()) <= day_in_miliseconds){
        var messages = thread.getMessages();
        // log message subject
        var message = messages[0]; // we only care for the first message
        Logger.log(message.getFrom() + " subject: "+ message.getSubject())
        if (message.getSubject().trim() == "fyi" && message.getFrom().indexOf("soegi") > 0){
//          Logger.log(message.getFrom() + " subject: "+ message.getSubject())
//          Logger.log(message.getBody());
//          var hrefs = /href="([^\'\"]+)/g.exec(message.getBody());
//          Logger.log(hrefs);
          var date = message.getDate()
          // post to google sites
          var fyi = "<h4>" + date.toLocaleDateString() + "</h4>"+message.getBody();
         addArticlesToPage(fyi);
        }
      }else{ // outdated message
        break;
      }
    }  
  }
  
};

function addArticlesToPage(fyi){
  var domain = 'kaskusnetworks.com'; // domain
  var sitenya = 'hakim'; // site
  var site = SitesApp.getSite(domain, sitenya);
  var page = SitesApp.getPageByUrl("https://sites.google.com/a/kaskusnetworks.com/hakim/home/articles");// change i
  var content = page.getHtmlContent();
  // append content
  content = content.replace("</div></td>","<br/>"+fyi+"</div></td>");
  page.setHtmlContent(content);
}

