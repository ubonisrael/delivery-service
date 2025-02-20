import { useAuth } from "@/context/authContext";

export default function Page() {
  const { user } = useAuth();
  return (
    <div className="p-4 flex gap-4">
      <div className="w-full px-4 pb-4">
        <p className="font-medium">{user.email}</p>
        <p className="font-medium">{user.role}</p>
        <ul className="flex gap-8">
          <li>
            <p className="font-medium capitalize text-sm">longitude</p>
            <span className="font-semibold">
              {user.location.coordinates[0]}
            </span>
          </li>
          <li>
            <p className="font-medium capitalize text-sm">latitude</p>
            <span className="font-semibold">
              {user.location.coordinates[1]}
            </span>
          </li>
        </ul>
      </div>
      <div className="mt-8">
        <div>
          <h2 className="font-medium">Start a chat</h2>
          <p>
            To start a one on one chat, on the right section of the group chat,
            is a list of all members
          </p>
          <p>Click on any member to start a chat</p>
        </div>
        <div className="mt-4">
          <h2 className="font-medium">Calculate delivery fee</h2>
          <p>
            Initiate a chat with the member whose location you want to calculate
            by following the steps abpve
          </p>
          <p className="">
            On the right section of the right chat is a form with location
            fields filled by default with the user's location. Click on the
            button to get an estimate of the delivery fee.
          </p>
        </div>
      </div>
    </div>
  );
}
