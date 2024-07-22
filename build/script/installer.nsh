!include "WordFunc.nsh"

!define VCLIB_VERSION "14.38"

!define VCLIB_X86_PATH "Installer\Dependencies\VC,redist.x86,x86,${VCLIB_VERSION},bundle"
!define VCLIB_X86_DOWNLOADURL "https://aka.ms/vs/17/release/vc_redist.x86.exe"
!define VCLIB_X64_PATH "Installer\Dependencies\VC,redist.x64,amd64,${VCLIB_VERSION},bundle"
!define VCLIB_X64_DOWNLOADURL "https://aka.ms/vs/17/release/vc_redist.x64.exe"

!macro preInit
    Var /GLOBAL VCRedistDownloadUrl

    ${If} ${RunningX64}
        ReadRegStr $R0 HKCR ${VCLIB_X64_PATH} "Version"
        IfErrors 0 VSRedistInstalled
        StrCpy $VCRedistDownloadUrl ${VCLIB_X64_DOWNLOADURL}
    ${Else}
        ReadRegStr $R0 HKCR ${VCLIB_X86_PATH} "Version"
        IfErrors 0 VSRedistInstalled
        StrCpy $VCRedistDownloadUrl ${VCLIB_X86_DOWNLOADURL}
    ${EndIf}

    MessageBox MB_YESNO "此应用程序需要$\r$\n\
    '适用于 Visual Studio 2015 - 2022 的 Microsoft Visual C++ 可再发行组件'$\r$\n\
    支持才可正常运作.$\r$\n$\r$\n\
    是否下载立即安装?$\r$\n\
    下载地址: $VCRedistDownloadUrl" /SD IDYES IDNO ExitAPP
    Goto VSRedistDownload

    ExitAPP:
        Quit

    VSRedistDownload:
        ; 创建临时文件夹
        CreateDirectory $TEMP\SourceBox
        ; 下载 VC++ 运行库安装包
        inetc::get "$VCRedistDownloadUrl" $TEMP\SourceBox\vc_redist.exe
        ; 执行安装
        ExecWait "$TEMP\SourceBox\vc_redist.exe /q"

    VSRedistInstalled:
        ;nothing to do here
    
    SetRegView 64
    WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\Program Files" 
    WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\Program Files"
    SetRegView 32
    WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\Program Files (x86)"
    WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\Program Files (x86)"
!macroend