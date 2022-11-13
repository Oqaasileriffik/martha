# Martha TTS / Greenlandic Text-to-Speech

* The `docker/` folder documents a container for the Martha TTS Web Service that'll allow anyone to run the Greenlandic text-to-speech service.
* The `js/` folder contains the JavaScript frontend for use on websites and documentation on how to use it.

## Public endpoint
Oqaasileriffik runs a public-facing TTS service endpoint for use by 3rd party app developers at https://oqaasileriffik.gl/martha/tts/ with generated audio under https://oqaasileriffik.gl/martha/data/

For example, https://oqaasileriffik.gl/martha/tts/?t=oqaatsit&n=json returns
```
{
  "fn": "10e2c4523ffcdf3db7638dfc07b79af6ea8ea616-8-1.mp3",
  "du": 1.222177,
  "sz": 12079,
  "ts": [
    [
      0.1,
      "oqaatsit"
    ]
  ]
}
```
where the actual MP3 can be loaded from https://oqaasileriffik.gl/martha/data/10/e2/10e2c4523ffcdf3db7638dfc07b79af6ea8ea616-8-1.mp3

The service limits input to 10000 Unicode characters. Please don't abuse it.
