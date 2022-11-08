#!/bin/bash

voicename=mv_kl_mlj
max_clients=10
port=12345
./festival --heap 2000000 -q --libdir lib "(addarchive \"scmlib.data\")" "(addarchive \"${voicename}_1.data\")" "(addarchive \"${voicename}_2.data\")" "(set! mv-modules-init '(\"${voicename}_init.scm\"))" "(set! mv_is_deployed t)" "(load (path-append libdir \"mv_init.scm\"))" '(load "stamp.scm")' "(set! server_max_client (set! server_max_clients ${server_maxclients}))" "(set! server_port ${port})" '(set! tts_hooks (remove utt.play tts_hooks))' '(utt.synth (Utterance Text "jafiljwcnhwuiacnhlv guer "))' '(gc)' --server
