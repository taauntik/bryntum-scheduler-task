<?php

session_start();

header('Content-Type: application/json');

if (!isset($_SESSION["resources"]) || isset($_GET["reset"])) {
    // Initialize session's resource data
    $_SESSION["resources"] = [
        [ "id" => 1, "car" => "Volvo V90", "dt" => date("Y-m-d H:i:s") ],
        [ "id" => 2, "car" => "Volvo XC60", "dt" => date("Y-m-d H:i:s") ],
        [ "id" => 3, "car" => "BMW M3", "dt" => date("Y-m-d H:i:s") ],
        [ "id" => 4, "car" => "BMW X5", "dt" => date("Y-m-d H:i:s") ],
        [ "id" => 5, "car" => "Peugeot 308", "dt" => date("Y-m-d H:i:s") ]
    ];
}

if (!isset($_SESSION["events"]) || isset($_GET["reset"])) {
    // Initialize session's event data
    $_SESSION["events"] = [
        [ "id" => 1, "resourceId" => 1, "name" => "Serve engine", "startDate" => "2018-05-21 08:00", "duration" => 2, "dt" => date("Y-m-d H:i:s") ],
        [ "id" => 2, "resourceId" => 1, "name" => "Paint job", "startDate" => "2018-05-21 12:00", "duration" => 2, "eventColor" => "violet", "dt" => date("Y-m-d H:i:s") ],
        [ "id" => 3, "resourceId" => 2, "name" => "Tune", "startDate" => "2018-05-21 07:00", "duration" => 1, "eventColor" => "teal", "dt" => date("Y-m-d H:i:s") ],
        [ "id" => 4, "resourceId" => 2, "name" => "Diagnostics", "startDate" => "2018-05-21 09:00", "duration" => 2, "eventColor" => "teal", "dt" => date("Y-m-d H:i:s") ],
        [ "id" => 5, "resourceId" => 3, "name" => "Replace engine", "startDate" => "2018-05-21 07:00", "duration" => 6, "dt" => date("Y-m-d H:i:s") ],
        [ "id" => 6, "resourceId" => 4, "name" => "New windshield", "startDate" => "2018-05-21 08:00", "duration" => 2, "dt" => date("Y-m-d H:i:s") ],
        [ "id" => 7, "resourceId" => 4, "name" => "Replace airbag", "startDate" => "2018-05-21 09:00", "duration" => 3, "dt" => date("Y-m-d H:i:s") ],
        [ "id" => 8, "resourceId" => 4, "name" => "Wash", "startDate" => "2018-05-21 14:00", "duration" => 2, "eventColor" => "indigo", "dt" => date("Y-m-d H:i:s") ],
        [ "id" => 9, "resourceId" => 5, "name" => "Repair cooler", "startDate" => "2018-05-21 10:00", "duration" => 7, "dt" => date("Y-m-d H:i:s") ]
    ];
}

function sendError($msg) {
    die(json_encode(
        [
            "success" => false,
            "msg"     => $msg
        ]));
}

function sendData($data) {
    die(json_encode(
        [
            "success" => true,
            "data"    => $data
        ]));
}

function sendSuccess() {
    die(json_encode(
        [
            "success" => true
        ]));
}

