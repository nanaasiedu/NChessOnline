# NChess Online

NChess Online is a basic chess app that allows people to play chess against their friends.

## Environment

The app should work with all environments that have installed. If you are having issues running commands try upgrade your node version (should work with node >14)
## Local

You can run a local node server using this command. The app will start at ```localhost:8080```

``npm start # run local web server
``

## Deployment
#### Heroku
``git push heroku master
``

## Unit tests

``npm run test
``

## End To End testing

The end to end test run using [cypress](https://www.cypress.io/). Make sure the app is running locally before starting tests.

```npm run e2e```

The tests rely on [PGN](https://en.wikipedia.org/wiki/Portable_Game_Notation) files in the [LAN format](https://en.wikipedia.org/wiki/Algebraic_notation_(chess)).
These files can be found in the ```fixtures``` folder of the cypress tests.

Most PGN formats are in the SAN format hence must be converted.
You can use the [pgn-extract](https://www.cs.kent.ac.uk/people/staff/djb/pgn-extract/) to convert SAN files to LAN files.

```bash
pgn-extract.exe -Wuci < file.pgn # WINDOWS: SAN -> LAN
```


