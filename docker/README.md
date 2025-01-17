# Martha TTS Web Service

Pre-built container available from [Docker Hub](https://hub.docker.com/r/oqaasileriffik/martha) as:<br>
`docker pull oqaasileriffik/martha`

You can also build it yourself with:<br>
`curl https://oqaasileriffik.gl/d/tts/martha-linux.tar.bz2 -o martha-linux.tar.bz2`<br>
`docker build -t martha .`

## Minimal Example
Run the daemon on localhost port 8000:<br>
`docker run --rm -it -p 8000:8000 oqaasileriffik/martha`

Use the daemon to generate an MP3 of Martha saying 'oqaatsit':<br>
`curl -sS 'http://localhost:8000/?t=oqaatsit' -o oqaatsit.mp3`

## Detailed Options
The container uses `/cache` to hold temporary WAVE and MP3 files. You should mount this to a volume or host folder and periodically remove files from it, or restart the container every so often.

The web service takes these parameters, either as GET or POST:
* `t` - the text to be spoken
* `f` - the format of the result, either `wav` or `mp3`. Defaults to `mp3`
* `q` - MP3 quality, an integer value between `1` and `9` inclusive, where `1` is best quality and `9` is worst. This is the value given to `lame -V`. Defaults to `1`
* `n` - if set to `1`, return the filename instead of the audio data. If set to `json`, returns JSON with filename and timestamps for each token in the text. Defaults to `0`

The purpose of `n=1` are for cases where the daemon's `/cache` folder is mounted in a location that the requestor has access to, so there is no point in sending the whole audio data.

`n=json` lets you implement precise highlighting of which word is being read.

A `wav` file is always generated and cached, even when `f=mp3` is set.

The daemon runs as a user with UID/GID `2134`, so this is also the UID/GID that files in `/cache` will have.

The cache uses hash-tiered storage. Files are named according to the SHA-1 hash of the `t` parameter, the byte length, and for MP3s the `q` parameter. For example, `t=oqaatsit` will yield a file named `10e2c4523ffcdf3db7638dfc07b79af6ea8ea616-8-1.mp3` which will be stored as `/cache/10/e2/10e2c4523ffcdf3db7638dfc07b79af6ea8ea616-8-1.mp3`

## Credits
Martha was created by [Mv-Nordic](http://mv-nordic.com/) (now named Vitec MV), with the help of [Oqaasileriffik](https://oqaasileriffik.gl/).

Currently maintained by [Oqaasileriffik](https://oqaasileriffik.gl/), primarily [Tino Didriksen](mailto:tino@oqaasileriffik.gl).

## Licence terms
The original and currently binding license terms for the Martha TTS is quoted below, typos and all. Note that this does not preclude using Martha in a commercial product or setting, merely that nobody (including us) may charge for a copy of Martha.

> As part of the agreement, the customer shall acquire all rights of royalty-free distribution and use to the solution without limitatation.
>
> The solution must not be sold, leased, rented or otherwise made available on commercial terms by the customer, supplier or any third party.
>
> There are no limitations or restrictions regarding royalty-free distribution of the Greenlandic voice and the supplementary parts to this such as the documentation, the maintenance tools, components and installations to every supported platform. The Greenlandic voice will not be sold, leased, rented or otherwise made available on commercial terms. The voice, including the supplementary parts to the voice, will not require any activation, registration or similar in order to be used.

The code and files in this repository are all under LGPL-3.0-or-later.
