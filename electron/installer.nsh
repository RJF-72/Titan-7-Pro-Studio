!macro customHeader
  BrandingText "Titan 7 Pro"
!macroend

!macro preInit
  SetRegView 64
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\{ce7c3cf0-4b8a-4f9a-8d3e-12a5b9c0d1e2}" "DisplayName" "Titan 7 Pro"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\{ce7c3cf0-4b8a-4f9a-8d3e-12a5b9c0d1e2}" "DisplayVersion" "${VERSION}"
!macroend
