# Martha TTS website script

Script to include in the page you want to enable Martha on:
```
<script src="https://oqaasileriffik.gl/d/martha.js"></script>
```

**PREVIEW / BETA**: `https://oqaasileriffik.gl/d/martha.js` is subject to change or removal as this is all very new and mostly untested, and we're gathering feedback from users. We will try to keep it compatible, but no guarantees. You can always download a copy of the file to your own site if you want to keep it stable.

By default, this only exports the event handler `martha.click()` which you can bind any button or link to. But it will also process these elements if they exist:

* Any element with class `martha-button` will be bound to `martha.click()`. If the element has an attribute `data-martha-id` then the corresponding single element will be picked. Otherwise, attribute `data-martha-select` will pick all elements matching the selector. Otherwise, attribute `data-martha-parent` will pick the closest single parent element matching the selector. Otherwise, the closest single parent with class `martha-article` will be picked. If no element is picked, an alert is shown.
  * The picked element(s) are then recursively searched for text nodes, and all such nodes are queued for reading out loud.
* The button's `data-martha-rate` attribute controls the [playbackRate](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/playbackRate). Default is 1.0.
* Elements with class `martha-skip` will never be read. This allows interleaving buttons and other elements in the to-be-read text.
* If you select any text in the page, a floating button is shown that will read only the selected text (it will expand to whole words).

**PRIVACY NOTICE**: This sends all texts to-be-read to Oqaasileriffik over HTTPS. If this is incompatible with your privacy policy, you can always install and run the Docker container yourself.

## Example
```
<script src="https://oqaasileriffik.gl/d/martha.js"></script>

<div class="martha-article">
<p id="whole">
Martha tassaavoq kalaallisut qarasaasiakkut atuffassissut. Atuffassissut Martha quppernermi matumani atorsinnaavat.
<span class="inners">Allagaq quppernerup affaanik takissusilik tamaat ikkunneqarsinnaavoq</span>, tassanngaaniilli
takinerusumik atuaasitsiniaruit atuffassissut Martha qarasaasiannut mobilinnulluunniit ikkuteqqaassavat
<span class="inners">ataaniittut innersuussissutit aqqutigalugit</span>.

<button class="martha-button martha-skip">Read the article</button>
</p>
</div>

<button class="martha-button martha-skip" data-martha-id="whole">Read the whole text</button>

<button class="martha-button martha-skip" data-martha-select=".inners">Read the inner texts</button>
```
