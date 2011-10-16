<?php
/**
 * build sane urls and dont let the user access more than he needs by filtering 
 * to get events also stores the access token in a secure manner. just a quick and
 * dirty hack really. 
 */

$C = parse_ini_file(dirname(__FILE__).'/../config.ini', true);

// the page we will be integrating
define('FB_PAGE_ID', $C['facebook']['page_id']);
// page access token to use
define('FB_ACCESS_TOKEN', $C['facebook']['access_token']);
// open graph endpoint
define('OG_ENDPOINT', 'https://graph.facebook.com/');
// cachefile
define('CACHEFILE', dirname(__FILE__).'/../cache/fb.cache');

if (file_exists(CACHEFILE) && time() - filemtime(CACHEFILE) < 300) {
	$data = json_decode(file_get_contents(CACHEFILE));
} else {
	$type = 'statuses';
	$url  = OG_ENDPOINT.FB_PAGE_ID.'/'.$type.'?access_token='.FB_ACCESS_TOKEN.'&date_format=U';//j.%20F%20Y,%20G:i';

	$data = json_decode(file_get_contents($url));
	foreach ($data->paging AS $key => $val) {
		$data->paging->$key = str_replace($url.'&', '', $val);
	}
	foreach ($data->data AS $ikey => $ival) {
		if ($ival->comments) {
			foreach ($ival->comments->data AS $key => $val) {
				$url = OG_ENDPOINT.$val->from->id;
				$data->data[$ikey]->comments->data[$key]->from->user_graph = json_decode(file_get_contents($url));
			}
		}
	}
	file_put_contents(CACHEFILE, json_encode($data));
}

header('Content-Type: 	text/javascript; charset=UTF-8'."\n");
echo json_encode($data);
