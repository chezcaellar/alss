import { Student } from "@/types";

export type StudentNameParts = {
  lastName: string;
  firstName: string;
  middleName: string;
};

const emptyNameParts: StudentNameParts = {
  lastName: "",
  firstName: "",
  middleName: "",
};

export function parseStudentName(fullName: string): StudentNameParts {
  if (!fullName || !fullName.trim()) {
    return { ...emptyNameParts };
  }

  const value = fullName.trim();

  if (value.includes(",")) {
    const [rawLast, ...rest] = value.split(",").map((segment) => segment.trim());
    const restJoined = rest.join(" ").trim();
    const restParts = restJoined.split(/\s+/).filter(Boolean);

    const firstName = restParts.shift() || "";
    const middleName = restParts.join(" ");

    return {
      lastName: rawLast || "",
      firstName,
      middleName,
    };
  }

  const parts = value.split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { ...emptyNameParts };
  }

  if (parts.length === 1) {
    return {
      lastName: parts[0],
      firstName: "",
      middleName: "",
    };
  }

  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  const middleName = parts.slice(1, -1).join(" ");

  return {
    firstName,
    middleName,
    lastName,
  };
}

export function composeStudentName(
  lastName: string,
  firstName: string,
  middleName?: string
): string {
  const trimmedLast = lastName.trim();
  const trimmedFirst = firstName.trim();
  const trimmedMiddle = middleName?.trim() ?? "";

  const segments = [trimmedLast, trimmedFirst, trimmedMiddle].filter(Boolean);
  return segments.join(", ");
}

export function getStudentNameParts(student?: Student | null): StudentNameParts {
  if (!student) {
    return { ...emptyNameParts };
  }

  const partsFromFields: StudentNameParts = {
    lastName: student.lastName?.trim() ?? "",
    firstName: student.firstName?.trim() ?? "",
    middleName: student.middleName?.trim() ?? "",
  };

  if (partsFromFields.lastName || partsFromFields.firstName || partsFromFields.middleName) {
    return partsFromFields;
  }

  if (student.name) {
    return parseStudentName(student.name);
  }

  return { ...emptyNameParts };
}

export function formatStudentName(student: Student | string): string {
  if (typeof student === "string") {
    const parts = parseStudentName(student);
    return [parts.lastName, parts.firstName, parts.middleName].filter(Boolean).join(", ");
  }

  const parts = getStudentNameParts(student);
  return [parts.lastName, parts.firstName, parts.middleName].filter(Boolean).join(", ");
}

export function unformatStudentName(formattedName: string): string {
  const { lastName, firstName, middleName } = parseStudentName(formattedName);
  return [firstName, middleName, lastName].filter(Boolean).join(" ");
}

