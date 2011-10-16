<?php

$url_tl = 'http://api.twitter.com/1/statuses/user_timeline.json?screen_name=purpurhas&include_entities=1';
$url_rt = 'http://api.twitter.com/1/statuses/retweeted_by_user.json?screen_name=purpurhas&include_entities=1';

define('CACHEFILE', dirname(__FILE__).'/../cache/twitter.cache');

if (file_exists(CACHEFILE) && time() - filemtime(CACHEFILE) < 300) {
        $data = json_decode(file_get_contents(CACHEFILE));
} else {
	$data = array_merge(
        json_decode(file_get_contents($url_tl)),
        json_decode(file_get_contents($url_rt))
    );
	file_put_contents(CACHEFILE, json_encode($data));
}

header('Content-Type: 	text/javascript; charset=UTF-8'."\n");
echo json_encode($data);
