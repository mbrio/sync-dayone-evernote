var fs = require('fs'),
    path = require('path'),
    xml2js = require('xml2js');

var testId = '0E44B9AE9F1A41198AA04E99DCC729DB';

var DayOneEntry = function (entryPath, data, sync) {
  this._sync = sync;
  this._path = entryPath;
  this._data = data;
  this._ext = path.extname(entryPath);
  this._id = path.basename(entryPath, this._ext);

  console.log(this._data);
};

DayOneEntry.prototype.hasImage = function () {
  return fs.existsSync(this._sync.photosPath() + '/' + this._id + '.jpg');
};

/* NEEDS MERGE */
var SyncDayOne = function (options) {
  this.options = options || {
    fileType: '.doentry',
    journalPath: process.env.HOME + '/Dropbox/Apps/Day\ One/Journal.dayone',
    entriesDirectory: 'entries',
    photosDirectory: 'photos'
  };

  this._fileTypeRegex = new RegExp(this.options.fileType.replace('.', '\\.') + '$', 'i');

  this._xmlParser = new xml2js.Parser();
};

SyncDayOne.prototype.journalPath = function () {
  return path.normalize(this.options.journalPath);
};

SyncDayOne.prototype.entriesPath = function () {
  return path.normalize(this.options.journalPath + '/' + this.options.entriesDirectory);
};

SyncDayOne.prototype.photosPath = function () {
  return path.normalize(this.options.journalPath + '/' + this.options.photosDirectory);
};

SyncDayOne.prototype.entry = function (id) {
  return new DayOneEntry(this.entriesPath() + id + this.options.fileType);
};

SyncDayOne.prototype.read = function () {
  var files = fs.readdir(this.entriesPath(), function (err, files) {
    this._readdir(err, files);
  }.bind(this));
};

SyncDayOne.prototype._readdir = function (err, files) {
  for (var fileIndex in files)
  {
    var entryPath = files[fileIndex];
    this.processEntry(this.entriesPath() + '/' + entryPath);
    if (fileIndex > 10) break;
  }
};

SyncDayOne.prototype.processEntry = function (entryPath) {
  if(this._fileTypeRegex.test(entryPath) === false) return;
  
  fs.readFile(entryPath, function(err, data) {
    this._xmlParser.parseString(data, function (err, result) {
        this.processData(entryPath, result);
    }.bind(this));
  }.bind(this));
};

SyncDayOne.prototype.processData = function (entryPath, data) {
  var entry = new DayOneEntry(entryPath, data, this);
};

var sync = new SyncDayOne();
sync.read();