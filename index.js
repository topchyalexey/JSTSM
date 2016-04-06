var swig = require('swig');

var f = swig.renderFile('templates/template.swift', {
    className: 'Test',
    variables: ['a', 'b', 'c']
});

console.log(f);
