# Martha TTS / Greenlandic Text-to-Speech

* The `docker/` folder documents a container for the Martha TTS Web Service that'll allow anyone to run the Greenlandic text-to-speech service.
* The `js/` folder contains the JavaScript frontend for use on websites and documentation on how to use it.

## Public endpoint
Oqaasileriffik runs a public-facing TTS service endpoint for use by 3rd party app developers at <https://oqaasileriffik.gl/martha/tts/> with generated audio under <https://oqaasileriffik.gl/martha/data/>

For example, <https://oqaasileriffik.gl/martha/tts/?t=oqaatsit&n=json> returns
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
where the actual MP3 can be loaded from <https://oqaasileriffik.gl/martha/data/10/e2/10e2c4523ffcdf3db7638dfc07b79af6ea8ea616-8-1.mp3>

The service limits input to 10000 Unicode characters. Please don't abuse it.

## Licence terms
The original and currently binding license terms for the Martha TTS is quoted below, typos and all. Note that this does not preclude using Martha in a commercial product or setting, merely that nobody (including us) may charge for a copy of Martha.

> As part of the agreement, the customer shall acquire all rights of royalty-free distribution and use to the solution without limitatation.
>
> The solution must not be sold, leased, rented or otherwise made available on commercial terms by the customer, supplier or any third party.
>
> There are no limitations or restrictions regarding royalty-free distribution of the Greenlandic voice and the supplementary parts to this such as the documentation, the maintenance tools, components and installations to every supported platform. The Greenlandic voice will not be sold, leased, rented or otherwise made available on commercial terms. The voice, including the supplementary parts to the voice, will not require any activation, registration or similar in order to be used.

The code and files in this repository are all under LGPL-3.0-or-later.
