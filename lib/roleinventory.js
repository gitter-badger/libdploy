var util      = require('util'),
    Role      = require('./role.js'),
    Inventory = require('./inventory.js');

module.exports = RoleInventory;

function RoleInventory(dir) {
    Inventory.call(this, dir, function(path) {
        return new Role(path);
    });
}

util.inherits(RoleInventory, Inventory);
