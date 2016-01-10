var util      = require('util'),
    Role      = require('./role.js'),
    Inventory = require('./utils/inventory.js');

function RoleInventory(dir) {
    Inventory.call(this, dir, function(path) {
        return new Role(path);
    });
}

util.inherits(RoleInventory, Inventory);

module.exports = RoleInventory;
