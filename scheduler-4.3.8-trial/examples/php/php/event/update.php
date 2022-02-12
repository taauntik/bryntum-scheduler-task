<?php

require_once "../session.php";

$data = isset($_POST["data"]) ? $_POST["data"] : $_GET["data"];
if (empty($data)) {
    sendError("No get/post data parameter");
}

$events  = $_SESSION["events"];
$mods    = json_decode($data, true);
$changed = [];

foreach ($mods as $mod) {
    $key    = array_search($mod["id"], array_column($events, "id"));
    $record = $events[$key];
    if (isset($record)) {
        foreach ($mod as $field => $value) {
            $record[$field] = $value;
        }
        $record["dt"] = date("Y-m-d H:i:s");
        $changed[]    = $record;
        $events[$key] = $record;
    }
}

$_SESSION["events"] = $events;

sendData($changed);
