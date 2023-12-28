# Remult-explorer


Standalone GUI to manage local remult entities


```shell
$ npx remult-explorer
```

## Arguments abilities

### port

Default port is 3002.

```shell
$ npx remult-explorer -p 4040
```


### entities-dir

By default, remult-explorer will search for entities inside directories with the names: `['entities', 'models', 'shared/entities']`.

You can mention different paths to entities directories with the following:

You can specify more then one directory.

```shell
$ npx remult-explorer -entities-dir custom-name -e other-dir
```


### target

By default, the explorer will create a standalone server using JSON database.
If you mention a target app, the app will proxy the remult requests to the target server

```shell
$ npx remult-explorer -t http://localhost:3000
```

Enjoy.