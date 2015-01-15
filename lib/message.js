var Attachment = require('./attachment');
var MailParser = new require("mailparser").MailParser;

var Message = function Message() {
};

Message.prototype.loadAttachments = function(parsedAttachments) {
    var self = this;
    parsedAttachments.forEach(function(parsedAttachment) {
        self.attachments.push(new Attachment(parsedAttachment));
    });
};

Message.prototype.delete = function() {
    this.markedAsDeleted = true;
};

function createFromRaw(raw, uid, seqNumber, callback) {
    var mailParser = new MailParser();
    mailParser.on("end", function(parsedEmail) {
        var msg = new Message();
        msg.messageId = (parsedEmail && parsedEmail.messageId) ? parsedEmail.messageId : "";
        msg.from = {
            name: (parsedEmail && parsedEmail.from && parsedEmail.from[0] && parsedEmail.from[0].name) ? parsedEmail.from[0].name : "",
            address: (parsedEmail && parsedEmail.from && parsedEmail.from[0] && parsedEmail.from[0].address) ? parsedEmail.from[0].address : ""
        };
        msg.subject = (parsedEmail && parsedEmail.subject) ? parsedEmail.subject : "";
        msg.headers = (parsedEmail && parsedEmail.headers) ? parsedEmail.headers : {};
        msg.html = parsedEmail && parsedEmail.html ? parsedEmail.html : '';
        msg.text = parsedEmail && parsedEmail.text ? parsedEmail.text : '';
        msg.size = 0;//?
        msg.date = (parsedEmail && parsedEmail.date) ? parsedEmail.date : null;
        msg.attachments = [];
        msg.loadAttachments((parsedEmail && parsedEmail.attachments) ? parsedEmail.attachments : []);
        msg.to = (parsedEmail && parsedEmail.to) ? parsedEmail.to : [];
        msg.cc = (parsedEmail && parsedEmail.cc) ? parsedEmail.cc : [];
        msg.bcc = (parsedEmail && parsedEmail.bcc) ? parsedEmail.bcc : [];//should be null if it's a received message
        msg.seqNumber = seqNumber;
        msg.uid = uid;
        callback(null, msg);
    });
    mailParser.write(raw);
    mailParser.end();
}
;

Message.prototype.setFrom = function(name, address) {
    this.from = {
        name: name,
        address: address
    };
};

Message.prototype.setSubject = function(subject) {
    this.subject = subject;
};

Message.prototype.setHtml = function(html) {
    this.html = html;
};

Message.prototype.setText = function(text) {
    this.text = text;
};

Message.prototype.addTo = function(name, address) {
    if (!this.to)
        this.to = [];
    this.to.push({name: name, address: address});
};

Message.prototype.addCc = function(name, address) {
    if (!this.cc)
        this.cc = [];
    this.cc.push({name: name, address: address});
};

Message.prototype.addBcc = function(name, address) {
    if (!this.bcc)
        this.bcc = [];
    this.bcc.push({name: name, address: address});
};

Message.prototype.attach = function(attachment) {
    if (!this.attachments)
        this.attachments = [];
    this.attachments.push(attachment);
};

Message.prototype.addHeader = function(key, value) {
    if (!this.headers)
        this.headers = [];
    var header = {key: key, value: value};
    this.headers.push(header);
};

Message.prototype.addAttachment = function() {
    var attachment = new Attachment();
    this.attach(attachment);
    return attachment;
};

module.exports = {
    createFromRaw: createFromRaw,
    create: function() {
        return new Message();
    }
};




