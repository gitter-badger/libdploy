var Git = require('nodegit'),
    path = require('path');

var GitHelper = {
    branch: function(repo) {
        // Get current branch
        return repo.getCurrentBranch()
        // Return well formatted branch
        .then(function(ref) {
            return Promise.resolve(path.parse(ref.name()).base);
        })
        .catch(function(err) {
            return Promise.reject('No master branch');
        });
    },

    // TODO References local vs remote branches
    branches: function(repo) {
        // Get repo references
        return repo.getReferences(Git.Reference.TYPE.LISTALL)

        // Filter only branches and get their names
        .then(function(refs) {
            return Promise.resolve(
                refs.filter(function(ref) {
                    return ref.isBranch();
                })
                .map(function(ref) {
                    return path.parse(ref.name()).base;
                }));
        });
    },

    checkoutRemoteBranch: function(repo, branch) {
        return repo.getBranchCommit('origin/' + branch)
        .then(function(commit) {
            return Git.Branch.create(repo, branch, commit, 1);
        })
        .then(function(ref) {
            return repo.checkoutBranch(ref, {
                checkoutStrategy: Git.Checkout.STRATEGY.FORCE
            });
        });
    },

    pullCurrentBranch: function(repo) {
        return repo.fetchAll()
        .then(function() {
            return GitHelper.branch(repo);
        })
        .then(function(branch) {
            return repo.mergeBranches(branch, 'origin/' + branch);
        });
    }
};

module.exports = GitHelper;
