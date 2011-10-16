<?php
/**
 * hack to get some data from http://ws.audioscrobbler.com/2.0/?method=user.getlovedtracks&user=hairmare&api_key=97ab5604662c6a5aae5805204e91548f
 *
 * this merges the data form multiple accounts and returns just that...
 */

$C = parse_ini_file(dirname(__FILE__).'/../config.ini', true);


define('AS_APIKEY', $C['lastfm']['api_key']);
define('CACHEFILE', dirname(__FILE__).'/../cache/lastfm.cache');

$users = $C['lastfm']['users'];

if (file_exists(CACHEFILE) && time() - filemtime(CACHEFILE) < 300) {
	$tracks = json_decode(file_get_contents(CACHEFILE));
} else {

	$tracks = array();
	foreach ($users AS $user) {
		$data = json_decode(file_get_contents('http://ws.audioscrobbler.com/2.0/?method=user.getlovedtracks&limit=5&user='.$user.'&api_key='.AS_APIKEY.'&format=json'));
		$data = $data->lovedtracks->track;
	
		foreach ($data AS $track) {
			$track->user = $user;
			$tracks[$track->url] = $track;
		}
	}
	file_put_contents(CACHEFILE, json_encode($tracks));
}

header('Content-Type:   text/javascript; charset=UTF-8'."\n");
echo json_encode($tracks);
