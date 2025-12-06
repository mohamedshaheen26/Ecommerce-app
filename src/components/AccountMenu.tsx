import { Divider, Menu, MenuItem, Tooltip } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MdLogout, MdOutlineAccountCircle } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AccountMenu = () => {
  const { logout } = useAuth();
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip arrow title={t("Go to your account")} placement='bottom'>
        <button
          onClick={handleOpen}
          className='cursor-pointer p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)]'
        >
          <MdOutlineAccountCircle className='h-6 w-6' />
        </button>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "var(--bg-primary)",
            color: "var(--text-secondary)",
          },
        }}
      >
        <MenuItem
          onClick={() => {
            navigate("/account");
            handleClose();
          }}
          sx={{
            gap: 1,
            "&.Mui-selected": {
              backgroundColor: "var(--accent-primary)",
              color: "var(--text-primary)",
            },
            "&.Mui-selected:hover": {
              backgroundColor: "var(--accent-primary)",
              color: "var(--text-primary)",
            },
            "&:hover": {
              backgroundColor: "var(--accent-hover)",
              color: "var(--text-primary)",
            },
          }}
        >
          <MdOutlineAccountCircle size={20} />
          {t("Profile")}
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={() => {
            logout();
            handleClose();
          }}
          sx={{
            gap: 1,
            "&:hover": {
              backgroundColor: "rgb(255 22 22 / 10%)",
              color: "rgb(255 84 84)",
            },
          }}
        >
          <MdLogout size={20} className='text-red-600' />
          {t("Logout")}
        </MenuItem>
      </Menu>
    </>
  );
};

export default AccountMenu;
