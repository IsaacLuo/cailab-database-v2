import mongoose from 'mongoose'
import {Schema} from 'mongoose'

export const UserSchema = new Schema({
  dbV1:{  // old data migrated from the cailab-database-v1 useless in v2
    id: Number,
    admin:Boolean,
    canEdit:Boolean,
    approved:Boolean,
    signInCount: Number,
  },
  email: String,
  authType: String, // 'logal' or 'google'
  passwordHash: String, // empty if user signed up using google account
  passwordSalt: String, // empty if user signed up using google account
  name: String, // user's full name
  abbr: String, // user's initial letters of full name
  groups: [String], // array of group name, 'guest', 'users', 'visitors', or 'administrators'
  createdAt: Date,
  updatedAt: Date,
  barcode: String,
  loginTags:[{    // tags are NFC, barcode, etc.
    hash: String,
    salt: String,
  }],
  defaultPickListId: String,
});

export const User = mongoose.model('User', UserSchema);

export const ContainerSchema = new Schema({
    ctype: String,
    barcode: String,
    assignedAt: Date,
    operator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    parentContainer: Schema.Types.ObjectId,
    locationBarcode: String,
    currentStatus: String,
});
export const Container = mongoose.model('Container', ContainerSchema);

export const PartSchema = new Schema({
  labName: String,                      // combined "labPrefix" and "labId", e.g. 'YCe1234', redundant information
  labPrefix: String,                    // the first part of labName, e.g. 'YCe'. e means E.coli
  labId: Number,                        // the second part of labName, e.g. 1234, incrementing.
  personalName: String,                 // combined "personalPrefix" and "personalId", e.g. 'YLe123', redundant information
  personalPrefix: String,               // the first part of personalName, e.g. 'YLe', YL is the initial letters of the user's name, e means E.coli 
  personalId: Number,                   // the second part of personalName, e.g. 123, incrementing.
  ownerId: Schema.Types.ObjectId,       // the ID of the owner
  ownerName: String,                    // the owner's name, redundant information
  sampleType: String,                   // 'bacterium', 'primer', or 'yeast'
  comment: String,                      // description of this part
  createdAt: Date,                      // database document creation date, generated by the program
  updatedAt: Date,                      // database document updating date, generated by the program
  date: Date,                           // the date of sample creation, not the database document creation date, given by user.
  tags: [String],                       
  content: {
    //primers only
    description: String,
    sequence: String,
    orientation: String,
    meltingTemperature: Number,
    concentration: String,
    vendor: String,
    
    //bacteria only
    plasmidName: String,
    hostStrain: String,

    //yeasts only
    parents: [String],
    genotype: [String],
    plasmidType: String,

    //bacteria and yeasts
    markers: [String],
    // all
    customData: Schema.Types.Mixed,  // any other {key:value} pairs are saved here
  },
  attachments: [{                    
    fileName: String,                // redundant information
    contentType: String,             // redundant information
    fileSize: Number,                // redundant information
    fileId: Schema.Types.ObjectId,   // id in the FileData modal
  }],
  containers: [{
    type: Schema.Types.ObjectId,
    ref: 'Container',
  }],
  dbV1:{                             // old id and user id data from the cailab-database-v1, useless in v2
    id: Number,
    userId: Number,
  },
  // history: Schema.Types.Mixed,      // previous version of this part.
  historyId: Schema.Types.ObjectId, // previous version of this part.
});

export const Part = mongoose.model('Part', PartSchema);

const FileDataSchema = new Schema({
  name: String,   // original file name, 
  contentType: String,  // MIME type
  size: Number,   // bytes
  data: Buffer,   // data in binary
})

export const FileData = mongoose.model('FileData', FileDataSchema);

export const PartsIdCounter = mongoose.model('PartsIdCounter', {
  name: String,
  count: Number,
});

export const LogLogin = mongoose.model('LogLogin', {
  operatorId: Schema.Types.ObjectId,
  operatorName: String,
  type: String,
  sourceIP: String,
  timeStamp: Date,
});

/**
 * level: the important level of operations
 *  - 0: debugging information
 *  - 1: listing or getting data
 *  - 2: exporting data
 *  - 3: adding more data into the database
 *  - 4: modifying data, deleting data,
 *  - 5: change previleges, change user information, and other admin operations
 */
export const LogOperation = mongoose.model('LogOperation', {
  operatorId: Schema.Types.ObjectId,
  operatorName: String,
  type: String,
  level: Number,        
  sourceIP: String,
  timeStamp: Date,
  data: Schema.Types.Mixed,
});

export const PartHistory = mongoose.model('PartHistory', {
  partId: Schema.Types.ObjectId,
  histories: [Schema.Types.Mixed],
});

export const PartDeletionRequest = mongoose.model('PartDeletionRequest', {
  senderId: Schema.Types.ObjectId,
  senderName: String,
  partId: Schema.Types.ObjectId,
  requestedCount: Number,
  requestedAt: [Date],
});

export const Broadcast = mongoose.model('Broadcast', {
  message: String,
});

export const PersonalPickListSchema = new Schema({
  name: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: Date,
  updatedAt: Date,
  parts: [{
    type: Schema.Types.ObjectId,
    ref: 'Part',
  }],
  partsCount: Number,
  default: Boolean,
});

export const PersonalPickList = mongoose.model('PersonalPickList', PersonalPickListSchema, 'PersonalPickLists');


export const Tube = mongoose.model('Tube', {
  barcode: String,

  rackBarcode: String,
  wellName: String,
  wellId: Number,

  verifiedAt: Date,

  part: PartSchema,

});

export const RackScannerRecord = mongoose.model('RackScannerRecord', {
  createdAt: Date,
  rackBarcode: String,
  tubes: [{
    wellName: String,
    wellId: Number,
    barcode: String,
  }]
});





export const LocationHistorySchema = new Schema({
  containerBarcode: String,
  locationBarcode: String,
})

export const LocationHistory = mongoose.model('LocationHistory', ContainerSchema, 'location_histories');