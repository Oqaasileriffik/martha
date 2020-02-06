<?php

$text = $_REQUEST['t'] ?? '';
$format = $_REQUEST['f'] ?? 'mp3';
$give_name = !empty($_REQUEST['n']);
// The -V value given to lame - default to 1, but allow 1-9 inclusive
$quality = min(max(intval($_REQUEST['q'] ?? 1), 1), 9);

$hash = sha1($text).'-'.strlen($text);
$folder = '/cache/'.substr($hash, 0, 2).'/'.substr($hash, 2, 2);
if (!file_exists("$folder/$hash.wav")) {
	chdir(__DIR__);
	if (!file_exists($folder)) {
		shell_exec("mkdir -p $folder");
	}
	$cmd = 'echo '.escapeshellarg($text)." | /usr/bin/timeout -k 15 10 ./client_say.sh $folder/$hash.wav >/dev/null 2>&1";
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

header("X-Cached-As: $rv");

if ($give_name) {
	header('Content-Type: text/plain; charset=UTF-8');
	header('Content-Length: '.strlen($rv));
	echo $rv;
}
else {
	header("Content-Type: $mime");
	header('Content-Length: '.filesize("$folder/$rv"));
	header("Content-Disposition: inline; filename=$rv");
	readfile("$folder/$rv");
}
