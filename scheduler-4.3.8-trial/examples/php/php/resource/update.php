<?php

require_once "../session.php";

$data = isset($_POST["data"]) ? $_POST["data"] : $_GET["data"];
if (empty($data)) {
    sendError("No get/post data parameter");
}

$resources = $_SESSION["resources"];
$mods      = json_decode($data, true);
$changed   = array ();

foreach ($mods as $mod) {
    $key    = array_search($mod["id"], array_column($resources, "id"));
    $record = $resources[$key];
    if (isset($record)) {
        foreach ($mod as $field => $value) {
            $record[$field] = $value;
        }
        $record["dt"]    = date("Y-m-d H:i:s");
        $changed[]       = $record;
        $resources[$key] = $record;
    }
}

$_SESSION["resources"] = $resources;

sendData($changed);
