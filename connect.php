<?php
require_once 'config.php';
/* Attempt to connect to MySQL database */
$conn = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Check connection
if ($conn === false) {
    die("ERROR: Could not connect. " . mysqli_connect_error());
}

function query($sql)
{
    global $conn;
    $result = mysqli_query($conn, $sql);
    unset($conn);
    return $result;
}

?>
