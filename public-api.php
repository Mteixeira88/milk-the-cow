<?php
header('Access-Control-Allow-Origin: *');
require_once('config.php');

function get_client_ip()
{
    if (isset($_SERVER['HTTP_CLIENT_IP']))
        $ipaddress = $_SERVER['HTTP_CLIENT_IP'];
    else if (isset($_SERVER['HTTP_X_FORWARDED_FOR']))
        $ipaddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
    else if (isset($_SERVER['HTTP_X_FORWARDED']))
        $ipaddress = $_SERVER['HTTP_X_FORWARDED'];
    else if (isset($_SERVER['HTTP_FORWARDED_FOR']))
        $ipaddress = $_SERVER['HTTP_FORWARDED_FOR'];
    else if (isset($_SERVER['HTTP_FORWARDED']))
        $ipaddress = $_SERVER['HTTP_FORWARDED'];
    else if (isset($_SERVER['REMOTE_ADDR']))
        $ipaddress = $_SERVER['REMOTE_ADDR'];
    else
        $ipaddress = 'UNKNOWN';
    return $ipaddress;
}

function get_location()
{
    $PublicIP = get_client_ip();
    $json = file_get_contents("http://ipinfo.io/$PublicIP/geo");
    $json = json_decode($json, true);
    $UserLocation = $json['country'] . ' - ' . $json['region'] . ' - ' . $json['city'];
    return [$PublicIP, $UserLocation];
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        post_handler();
        return;
    case 'GET':
        get_handler();
        return;
    default:
        echo 'Not implemented';
        return;
}

function post_handler()
{
    $data = json_decode($_POST['data'], true);
    $action = $data['action'];
    if ($data['args']) {
        $args = $data['args'];
    } else {
        $args = [];
    }
    $result = call_user_func_array($action, [$args]);
    echo json_encode($result);
}

function get_handler()
{
    echo '404 - Page not found.';
}

/**
 * FUNCTIONS
 *
 */

function viewRanking()
{
    $sql = 'SELECT * FROM ranking ORDER BY score DESC LIMIT 5';
    if ($result = query($sql)) {
        if (mysqli_num_rows($result) > 0) {
            $rankingTable = [];
            while ($row = $result->fetch_assoc()) {
                array_push($rankingTable, $row['score']);
            }
            rsort($rankingTable);
            // Free result set
            unset($result);
        }
    } else {
        return "ERROR: Could not able to execute $sql. ";
    }
    return $rankingTable;
}


function insertScore($value)
{
    $timestamp = date('Y-m-d G:i:s');
    $userDetails = get_location();
    $sql = "INSERT INTO ranking (id, score, timestamp, ip, location) VALUES (NULL, '$value', '$timestamp', '$userDetails[0]', '$userDetails[1]')";
    if ($result = query($sql)) {
        return $result;
    } else {
        return "ERROR: Could not able to execute $sql. ";
    }
}

?>
