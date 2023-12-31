
var dcopy = require('deep-copy')
var validate = require('../editview/validate')
var format = require('../format')


var _blank = (args) => {
  var table = args.config.table
  var columns = args.config.columns

  var names = [], blank = []
  for (var i=0; i < columns.length; i++) {
    names.push(columns[i].name)
    blank.push(dcopy(columns[i]))
  }

  for (var i=0; i < names.length; i++) {
    if (args.type === 'view') {
      blank[i].key = args.type+'['+table.name+'][records][0][columns]['+names[i]+']'
    }
    else {
      blank[i].key = args.type+'['+table.name+'][blank][index][columns]['+names[i]+']'
    }
  }

  return blank
}

var _insert = (args) => {
  var table = args.config.table
  return {
    key: args.type+'['+table.name+'][blank][index][insert]',
    value: true
  }
}

var _records = (args, rows) => {
  var table = args.config.table
  var records = []
  for (var i=0; i < rows.length; i++) {

    var values = rows[i].columns
    var record = args.type+'['+table.name+'][records]['+i+']'

    var pk = {
      key: record+'[pk]',
      value: rows[i].pk || values['__pk']
    }

    var insert = rows[i].insert
      ? {
        key: record+'[insert]',
        value: true
      } : null

    var remove = {
      key: record+'[remove]',
      value: rows[i].remove ? true : null
    }

    var columns = dcopy(args.config.columns)
    for (var j=0; j < columns.length; j++) {

      var column = columns[j]
      column.key = record+'[columns]['+column.name+']'

      var value = values[column.name]
      column.error = validate.value(column, value)
      column.value = format.form.value(column, value)
      args.error = column.error ? true : args.error
    }
    records.push({pk: pk, columns: columns, insert: insert, remove: remove})
  }
  return records
}

// `rows` comes either from sql select of from post request
exports.get = (args, rows) => ({
  name: args.config.table.name,
  verbose: args.config.table.verbose,
  records: _records(args, rows),
  blank: _blank(args),
  insert: _insert(args),
})
