<?php

$text = $_REQUEST['t'] ?? '';
$format = $_REQUEST['f'] ?? 'mp3';
$return_type = $_REQUEST['n'] ?? 0;
// The -V value given to lame - default to 1, but allow 1-9 inclusive
$quality = min(max(intval($_REQUEST['q'] ?? 1), 1), 9);

$hash = sha1($text).'-'.strlen($text);
$folder = '/cache/'.substr($hash, 0, 2).'/'.substr($hash, 2, 2);
$basename = "$folder/$hash";
if (!file_exists("$basename.time")) {
	chdir(__DIR__);
	if (!file_exists($folder)) {
		shell_exec("mkdir -p $folder");
	}
	$scm = '(set! utt1 (Utterance Text "'.addcslashes($text, '\\"').'")) (utt.synth utt1) (utt.save.wave utt1 "'.$basename.'.wav") (utt.save.start_times utt1 "'.$basename.'.time")';
	$cmd = 'echo '.escapeshellarg($scm)." | /usr/bin/timeout -k 15 10 ./festival_client --port 12345 >/dev/null 2>&1";
	shell_exec($cmd);
}

$mime = 'audio/wav';
$rv = "$hash.wav";

if ($format === 'mp3') {
	if (!file_exists("$folder/$hash-$quality.mp3")) {
		chdir($folder);
		shell_exec("lame -V$quality '$hash.wav' '$hash-$quality.mp3' >$hash-$quality.lame.log 2>&1");
	}
	$mime = 'audio/mpeg';
	$rv = "$hash-$quality.mp3";
}

if ($return_type === 'json') {
	$json = [
		'fn' => $rv,
		'ts' => [],
		];
	$ts = explode("\n", trim(file_get_contents("$basename.time")));
	foreach ($ts as $t) {
		if (strpos($t, '0.0000 ') === 0) {
			continue;
		}
		if (!preg_match('~^([\d.]+) (.+)$~', $t, $m)) {
			continue;
		}
		$json['ts'][] = [$m[1], $m[2]];
	}

	$json = json_encode($json, JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);

	header('Content-Type: application/json; charset=UTF-8');
	header('Content-Length: '.strlen($json));
	echo $json;
}
else if ($return_type) {
	header('Content-Type: text/plain; charset=UTF-8');
	header('Content-Length: '.strlen($rv));
	echo $rv;
}
else {
	header("X-Cached-As: $rv");
	header("Content-Type: $mime");
	header('Content-Length: '.filesize("$folder/$rv"));
	header("Content-Disposition: inline; filename=$rv");
	readfile("$folder/$rv");
}
