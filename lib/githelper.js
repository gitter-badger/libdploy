var Git            = require('nodegit'),
    path           = require('path'),
    rm             = require('./utils.js').rm,
    fs             = require('fs'),
    GitModulesFile = require('./gitmodulesfile.js');

var HEAD = 'HEAD';

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
    },

    addFile: function(repo, path) {
        var index;

        // Open repository index
        return repo.openIndex()

        // Add file to index
        .then(function(_index) {
            index = _index;
            return index.addByPath(path);
        })

        // Write the index
        .then(function() {
            return index.write();
        });
    },

    removeFile: function(repo, path) {
        var index;

        // Open repository index
        return repo.openIndex()

        // Add file to index
        .then(function(_index) {
            index = _index;
            return index.removeByPath(path);
        })

        // Write the index
        .then(function() {
            return index.write();
        });
    },

    commit: function(repo, author, comment) {
        var oid;

        // Cast comment if not defined
        if (typeof comment === 'undefined') {
            comment = '';
        }

        // Open repository index
        return repo.openIndex()
        // Write the index tree
        .then(function(index) {
            return index.writeTree();
        })
        // Retrieve the HEAD reference
        .then(function(_oid) {
            oid = _oid;
            return GitHelper.headCommit(repo);
        })
        // Finally do the commit
        .then(function(parent) {
            var sign;
            if (! author) {
                sign = repo.defaultSignature();
            } else {
                sign = Git.Signature.now(author.name, author.mail);
            }

            return repo.createCommit(
                HEAD,                       // Create commit on HEAD
                sign, sign,                 // Author and committer
                comment,                    // Comment
                oid,                        // Index OID ref.
                (parent ? [parent] : []));  // Parent HEAD if exists
        })
        .then(function() {
            return Promise.resolve();
        })
    },

    headCommit: function(repo) {
        // Get commit from HEAD reference
        return Git.Reference.nameToId(repo, HEAD)

        // Get commit from HEAD reference
        .then(function(head) {
            return repo.getCommit(head);
        })
        // Return the only one parent in an array
        .then(function(commit) {
            return Promise.resolve(commit);
        })
        // If an issue append is probably because HEAD is not already created.
        // So we check if it is the first commit and then return empty array.
        .catch(function() {
            return Promise.resolve(false);
        });
    },

    addSubmodule: function(repo, url, local) {
        // Setup the submodule
        return Git.Submodule.addSetup(repo, url, local, 0)

        // Finalize the submodule: add it to index
        .then(function(submodule) {
            if (submodule.addFinalize() == 0) {
                return Promise.resolve();
            }
            return Promise.reject();
        });
    },

    // repo: the repo
    // submodule: the RELATIVE path to submodule in this repository
    removeSubmodule: function(repo, submodule) {
        var repo_path = path.dirname(repo.path());

        // Remove directory submodule
        return rm(path.join(repo_path, submodule))

        // NOTE: [PATCH] Update .gitmodules file
        // TODO: Replace it by native git-config from libgit2 (currently 501)
        .then(function() {
            var gms = new GitModulesFile(path.join(repo_path, '.gitmodules'));
            return gms.open()
            .then(function() {
                gms.remove(submodule);
                return gms.write();
            });
        })

        // Open repository's index
        .then(function() {
            return repo.openIndex();
        })

        // Remove submodule from index
        .then(function(index) {
            index.removeByPath(submodule);
            index.addByPath('.gitmodules');
            return index.write();
        });
    }
};




module.exports = GitHelper;