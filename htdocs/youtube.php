<?php

$url = 'http://gdata.youtube.com/feeds/api/users/hairmareThe1st/uploads?orderby=updated&v=2&alt=jsonc';

define('CACHEFILE', dirname(__FILE__).'/../cache/youtube.cache');

if (file_exists(CACHEFILE) && time() - filemtime(CACHEFILE) < 300) {
	$data = json_decode(file_get_contents(CACHEFILE));
} else {
	$data = json_decode(file_get_contents($url));
	file_put_contents(CACHEFILE, json_encode($data));
}

header('Content-Type: 	text/javascript; charset=UTF-8'."\n");
echo json_encode($data);
