"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LogoutModal from "@/components/logout_modal";
import {
  faBoxesStacked,
  faCashRegister,
  faCircleUser,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import LogoutIcon from '@mui/icons-material/Logout';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "lucide-react";

export default function ProfilePage() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [phone, setPhone] = useState("");
  const [fullname, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [role, setRole] = useState("")
  const [hoverInventory, setHoverInventory] = useState(false);
  const [employeeId, setEmployeeId] = useState("")

  const [todaySales, setTodaySales] = useState(0)
  const [hoursWorked, setHoursWorked] = useState(0)

  const [shifts, setShifts] = useState<any[]>([]);

  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [pausing, setPausing] = useState(false);

  useEffect(() => {
  const loadUser = async () => {
    setLoading(true);

    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      setLoading(false);
      return;
    }

    const parsedUser = JSON.parse(storedUser);


    // FETCH FRESH DATA FROM SUPABASE
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("email", parsedUser.email)
      .single();

    if (error || !data) {
      console.error("Failed to fetch user:", error);
      setLoading(false);
      return;
    }

    // console.log("FRESH USER FROM DB:", data);

    setEmail(data.email);
    setFullName(data.full_name ?? "");
    setPhone(data.phone ?? "");
    setProfileImage(data.profile_image + "?t=" + Date.now());
    setRole(data.role ?? "");
    setEmployeeId(data.employee_id ?? "");

    // update localStorage with fresh data
    localStorage.setItem("user", JSON.stringify(data));

    setLoading(false);
  };

  loadUser();
}, []);

    useEffect(() => {
    const fetchShiftData = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;

      const user = JSON.parse(storedUser);
      const employeeId = user.employee_id || user.id;

      const { data, error } = await supabase
        .from("shifts")
        .select("*")
        .eq("employee_id", employeeId)
        .is("clock_out", null);


      if (error) {
        console.error("SHIFT ERROR:", error);
        return;
      }

      setShifts(data || []);
    };

    fetchShiftData();
  }, []);

   useEffect(() => {
    const interval = setInterval(() => {
    let totalSeconds = 0;

    shifts.forEach((shift: any) => {
      const clockIn = new Date(shift.clock_in).getTime();

      let endTime;

      if (shift.clock_out) {
        endTime = new Date(shift.clock_out).getTime();
      } else if (shift.is_paused && shift.paused_at) {
        endTime = new Date(shift.paused_at).getTime(); // ✅ STOP at pause
      } else {
        endTime = Date.now(); // ✅ running
      }

      totalSeconds += (endTime - clockIn) / 1000;
    });

    setHoursWorked(totalSeconds / 3600);
    }, 1000);

    return () => clearInterval(interval);
  }, [shifts]);

  const handleImageUpload = async (e: any) => {
  const file = e.target.files[0];
  if (!file) return;

  const storedUser = localStorage.getItem("user");
  if (!storedUser) {
    alert("No user session");
    return;
  }

  const parsedUser = JSON.parse(storedUser);

  const fileExt = file.name.split(".").pop();
  const fileName = `${parsedUser.employee_id}.${Date.now()}.${fileExt}`; 

  // upload to bucket
  const { error: uploadError } = await supabase.storage
    .from("avatars") // ⚠️ must match your bucket name
    .upload(fileName, file, {
      upsert: true,
    });

  if (uploadError) {
    console.error(uploadError);
    alert("Upload failed");
    return;
  }

  // get public URL
  const { data } = supabase.storage
    .from("avatars")
    .getPublicUrl(fileName);

  setProfileImage(data.publicUrl + "?+=" + Date.now()); // ✅ store in state

  e.target.value = "";
};

  const handleSave = async () => {

  // ✅ VALIDATION FIRST (before setSaving)
  if (!phone || phone.trim() === "" || phone === "+63") {
    alert("Phone number is required");
    return;
  }

  // ✅ optional: enforce full PH format
  if (phone.length !== 13) {
    alert("Phone must be 10 digits after +63");
    return;
  }

  setSaving(true);

  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    alert("No user session");
    setSaving(false);
    return;
  }

  const parsedUser = JSON.parse(storedUser);

  // console.log("SAVING USER:", parsedUser);

  const { data, error } = await supabase
    .from("accounts")
    .update({
      full_name: fullname,
      phone: phone,
      profile_image: profileImage,
      updated_at: new Date().toISOString(),
    })
    .eq("email", parsedUser.email)
    .select()
    .maybeSingle();

  setSaving(false);

  if (error) {
    console.error("FULL ERROR:", error);
    alert(error.message);
    return;
  }

  if (!data) {
    alert("No row updated (check your email match)");
    return;
  }

  localStorage.setItem("user", JSON.stringify(data));

  alert("Profile updated successfully");

  
  };
  useEffect(() => {
  const fetchSales = async () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const user = JSON.parse(storedUser);

    const employeeId = user.employee_id; // 👈 logged-in user only

    const { data, error } = await supabase
      .from("sales")
      .select("total")
      .eq("employee_id", employeeId) // ✅ ONLY THIS ACCOUNT
      .eq("payment_method", "cash");

      // console.log(employeeId)
      // console.log(user)
      // console.log(data)

    if (error) {
      console.error(error);
      return;
    }

    const total =
      data?.reduce((sum, s) => sum + (Number(s.total) || 0), 0) || 0;

    setTodaySales(total);
  };

  fetchSales();
}, []);

  const handleLogout = async () => {
  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const user = JSON.parse(storedUser);

    const { data: shift, error } = await supabase
      .from("shifts")
      .select("*")
      .eq("employee_id", user.employee_id)
      .is("clock_out", null)
      .maybeSingle(); // ✅ safer than single()

    if (error) {
      console.error("FETCH SHIFT ERROR:", error);
    }

    if (shift) {
      const { error: updateError } = await supabase
        .from("shifts")
        .update({
          clock_out: new Date().toISOString(),
          is_paused: false,
          paused_at: null,
        })
        .eq("id", shift.id);

      if (updateError) {
        console.error("CLOCK OUT ERROR:", updateError);
          }
        }

        localStorage.removeItem("user");
        router.push("/login");

      } catch (err) {
        console.error("LOGOUT ERROR:", err);
      }
    };

    const formatHours = (decimalHours: number) => {
    const totalSeconds = Math.floor(decimalHours * 3600);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}:${minutes.toString().padStart(2, "0")}`
  };   
    
      const handlePause = async () => {
          const storedUser = localStorage.getItem("user");
          if (!storedUser) return;

          const user = JSON.parse(storedUser);

          // get active shift
          const { data: shift } = await supabase
            .from("shifts")
            .select("*")
            .eq("employee_id", user.employee_id)
            .is("clock_out", null)
            .single();

          if (!shift) return;

          // ✅ pause shift
          await supabase
            .from("shifts")
            .update({
              is_paused: true,
              paused_at: new Date().toISOString(),
            })
            .eq("id", shift.id);

          // ✅ logout AFTER pause
          localStorage.removeItem("user");
          router.push("/login");
        };
  return (
    <><div className="flex min-h-screen bg-[#f8f9ff] text-[#121c28]">
      {/* LEFT NAVIGATION */}
      <div className="flex-col bg-green-900 lg:w-3xs md:w-52 sm:w-1">
        <div className="flex-col pl-4">
          <h1 className="text-6xl font-bold text-[#FFB900]">Tory</h1>
          <p className="text-white pl-2">POS SYSTEM</p>
        </div>

        <div className="flex-col mt-6 ml-5">
          <Link href={role === "admin" ? "/adminDashboard" : "/ScannerPage"}>
            <div className="flex-col mt-6 cursor-pointer">
              <div
                className="p-0.5 pl-2.5 pt-2.5 pb-2.5 flex flex-row gap-1 items-center rounded-md w-52 font-medium text-white hover:bg-[#FFB900] hover:text-[#F54900] transition-all duration-300  "
                onMouseEnter={() => setHoverInventory(true)}
                onMouseLeave={() => setHoverInventory(false)}
              >
                <FontAwesomeIcon icon={faCashRegister} />
                <h1>{role === "admin" ? "Dashboard" : "Cashier"}</h1>
              </div>
            </div>
          </Link>

          <div
            className="mt-2.5 p-2 flex items-center gap-2 rounded-md w-52 font-medium text-white hover:bg-[#FFB900] hover:text-[#F54900] transition-all duration-300 "
            onMouseEnter={() => setHoverInventory(true)}
            onMouseLeave={() => setHoverInventory(false)}
          >
            <FontAwesomeIcon icon={faBoxesStacked} />
            Inventory
          </div>

          <Link href="/utang">
            <div
              onMouseEnter={() => setHoverInventory(true)}
              onMouseLeave={() => setHoverInventory(false)}
              className="mt-2.5 p-0.5 pl-2.5 pt-2.5 pb-2.5 flex-row flex gap-1 items-center rounded-md w-52 font-medium text-white hover:bg-[#FFB900] hover:text-[#F54900] transition-all duration-300 "
            >
              <HistoryEduIcon />
              <h1>Utang</h1>
            </div>
          </Link>

          <Link href="/profile">
            <div
              className={`mt-2.5 p-2 flex items-center gap-2 rounded-md w-52 font-medium transition-all duration-300 ${hoverInventory
                  ? "bg-transparent text-white"
                  : "bg-[#FFB900] text-[#F54900]"}`}
            >
              <FontAwesomeIcon icon={faCircleUser} />
              Profile
            </div>
          </Link>
        </div>
      </div>

      {/* MAIN */}
      <main className="flex-1 p-8">
        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-[#003527]">
            Cashier Portal
          </h2>

          <div className="flex gap-3">
            <button>🔔</button>
            <button>🕒</button>
            <img
              src={profileImage || "/default-avatar.png"}
              className="w-10 h-10 rounded-full object-cover bg-gray-300" />
          </div>
        </div>

        {/* PROFILE CARD */}
        <div className="bg-white p-6 rounded-xl shadow mb-6 flex gap-6 items-center">

          {/* IMAGE */}
          <div className="flex flex-col items-center ml-">
            <img
              src={profileImage || "/default-avatar.png"}
              className="w-24 h-24 rounded-full object-cover bg-gray-300" />
            <label className="mt-2 text-sm cursor-pointer px-3 py-1 rounded inline-block">
              Choose Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden" />
            </label>
          </div>

          {/* USER INFO */}
          <div>
            <h3 className="text-2xl font-bold">
              {fullname || "No Name Yet"}
            </h3>
            <p className="text-green-700 font-semibold">{role}</p>
            <p className="text-sm text-gray-500">{email}</p>
          </div>

          {/* BUTTONS */}
          <div className="ml-auto flex gap-2">
            <button className="px-4 py-2 border rounded-lg">Cancel</button>

            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#003527] text-white rounded-lg flex items-center gap-2"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </div>

        {/* FORM */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow space-y-4">
            <h4 className="font-bold text-lg">Personal Information</h4>

            <div>
              <label className="text-sm text-gray-500">Full Name</label>
              <input
                className="w-full border p-2 rounded"
                value={fullname}
                onChange={(e) => setFullName(e.target.value)} />
            </div>

            <div>
              <label className="text-sm text-gray-500">Email</label>
              <input
                className="w-full border p-2 rounded"
                value={email}
                readOnly />
            </div>

            <div>
              <label className="text-sm text-gray-500">Phone</label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={phone}
                onChange={(e) => {
                  let value = e.target.value;


                  if (value.startsWith("+63")) {
                    value = value.slice(3);
                  }

                  value = value.replace(/\D/g, "");


                  value = value.slice(0, 10);


                  setPhone("+63" + value);
                } } />
            </div>

            <div>
              <label className="text-sm text-gray-500">Employee ID</label>
              <input
                className="w-full border p-2 rounded bg-gray-100"
                value={employeeId}
                disabled />
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">
            <div className="bg-green-900 text-white p-6 rounded-xl">
              <h4 className="text-lg font-bold mb-4">Shift Summary</h4>
              <p>Hours: {formatHours(hoursWorked)}</p>
              <p>Sales: ₱{todaySales.toLocaleString()}</p>
            </div>

            <div className="bg-yellow-100 p-6 rounded-xl">
              <h5 className="font-bold">Tip</h5>
              <p className="text-sm">
                Check inventory before shift to speed up sales.
              </p>
            </div>
            <div className="flex flex-row-reverse ">
              <div className="border-2 rounded-md p-1.5 bg-gray-700 font-medium text-lg text-white cursor-pointer" onClick={() => setShowModal(true)}>
                <LogoutIcon />
                Logout
              </div>
            </div>
          </div>
        </div>
      </main>
    </div><LogoutModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}

        onBreak={async () => {
            try {
              setPausing(true);
              await handlePause(); // already logs out
              setShowModal(false);
            } catch (err) {
              alert("Failed to pause shift");
            } finally {
              setPausing(false);
            }
          }}

        onLogout={async () => {
          setShowModal(false);
          await handleLogout();
        }} />
        </>
  );
}