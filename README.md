# Resume Editor

This is the live editor for http://registry.jsonresume.org/.

## Development

If you're going to clone this repository, remember that `json-builder` is a submodule.

So, after you've cloned the repository, fetch the submodule:

```
git submodule update --init
```

### Using Grunt

Install [Grunt](http://gruntjs.com/):

```
sudo npm -g install grunt-cli
```

When that is done, run `npm install` while standing in the repository folder.

You can now concat the files:

```
grunt uglify
```

## License

Available under [the MIT license](http://mths.be/mit).
