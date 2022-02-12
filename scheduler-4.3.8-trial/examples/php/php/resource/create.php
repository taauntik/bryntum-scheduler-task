<?php

require_once "../session.php";

$data = isset($_POST["data"]) ? $_POST["data"] : $_GET["data"];
if (empty($data)) {
    sendError("No get/post data parameter");
}

$resources = $_SESSION["resources"];
$mods      = json_decode($data, true);
$added     = array ();

foreach ($mods as $mod) {
    $mod["id"]   = count($resources) + 2;
    $mod["dt"]   = date("Y-m-d H:i:s");
    $resources[] = $mod;
    $added[]     = $mod;
}

$_SESSION["resources"] = $resources;

sendData($added);
