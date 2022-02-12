<?php

require_once "../session.php";

$data = isset($_POST["data"]) ? $_POST["data"] : $_GET["data"];
if (empty($data)) {
    sendError("No get/post data parameter");
}

$events = $_SESSION["events"];
$mods   = json_decode($data, true);
$added  = array ();

foreach ($mods as $mod) {
    $mod["id"] = count($events) + 2;
    $mod["dt"] = date("Y-m-d H:i:s");
    $events[]  = $mod;
    $added[]   = $mod;
}

$_SESSION["events"] = $events;

sendData($added);
