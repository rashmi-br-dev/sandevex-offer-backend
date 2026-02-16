$file = Get-Content "src\routes\offerRoutes.ts"
$newFile = @()

for ($i = 0; $i -lt $file.Count; $i++) {
    $line = $file[$i]
    $lineNumber = $i + 1
    
    if ($lineNumber -eq 331) {
        $newFile += $line
        $newFile += ""
        $newFile += "    // Ensure email is defined"
        $newFile += "    if (!email || typeof email !== 'string') {"
        $newFile += "      return res.status(400).json({ message: 'Valid email is required' });"
        $newFile += "    }"
    } else {
        $newFile += $line
    }
}

$newFile | Set-Content "src\routes\offerRoutes.ts"
