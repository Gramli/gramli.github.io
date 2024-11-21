*Posted 11/10/2024*
# Caret Ranges ^1.2.3 ^0.2.5 ^0.0.4
Allows changes that do not modify the left-most non-zero digit in the [major, minor, patch] tuple. In other words, this allows patch and minor updates for versions 1.0.0 and above, patch updates for versions 0.X >=0.1.0, and no updates for versions 0.0.X.

### General
* ^1.2.3 := >=1.2.3 <2.0.0
* ^0.2.3 := >=0.2.3 <0.3.0
* ^0.0.3 := >=0.0.3 <0.0.4

### Missing patch
* ^1.2.x := >=1.2.0 <2.0.0
* ^0.0.x := >=0.0.0 <0.1.0
* ^0.0 := >=0.0.0 <0.1.0

### Missing Minor
* ^1.x := >=1.0.0 <2.0.0
* ^0.x := >=0.0.0 <1.0.0

### Original [semver docs](https://docs.npmjs.com/cli/v6/using-npm/semver)  
### Original [npm docs](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#dependencies)