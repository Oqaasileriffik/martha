<?php

$origin = '*';
if (!empty($_SERVER['HTTP_ORIGIN'])) {
	$origin = trim($_SERVER['HTTP_ORIGIN']);
}
header('Access-Control-Allow-Origin: '.$origin);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
	header('HTTP/1.1 200 Options');
	die();
}

$text = $_REQUEST['t'] ?? '';
$format = $_REQUEST['f'] ?? 'mp3';
$return_type = $_REQUEST['n'] ?? 0;
// The -V value given to lame - default to 1, but allow 1-9 inclusive
$quality = min(max(intval($_REQUEST['q'] ?? 1), 1), 9);

// If text is longer than 10000 Unicode code points, trim to nearest word under
if (mb_strlen($text) > 10000) {
	$text = mb_substr($text, 0, 10000);
	$text = preg_replace('~\s*\S+$~', '', $text);
}

$hash = sha1($text).'-'.strlen($text);
$folder = '/cache/'.substr($hash, 0, 2).'/'.substr($hash, 2, 2);
$basename = "$folder/$hash";
if (!file_exists("$basename.dur")) {
	chdir(__DIR__);
	if (!file_exists($folder)) {
		shell_exec("mkdir -p $folder");
	}
	$scm = '(set! utt1 (Utterance Text "'.addcslashes($text, '\\"').'")) (utt.synth utt1) (utt.save.wave utt1 "'.$basename.'.wav") (utt.save.start_times utt1 "'.$basename.'.time")';
	$cmd = 'echo '.escapeshellarg($scm)." | /usr/bin/timeout -k 15 10 ./festival_client --port 12345 >/dev/null 2>&1";
	shell_exec($cmd);
	shell_exec("soxi -D '$basename.wav' > '$basename.dur'");
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
		'du' => floatval(trim(file_get_contents("$basename.dur"))),
		'sz' => filesize("$folder/$rv"),
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
		$json['ts'][] = [floatval($m[1]), $m[2]];
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
